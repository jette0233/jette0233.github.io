from __future__ import annotations

import hashlib
import hmac
import os
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from flask import Flask, current_app, g, jsonify, request


TASK_ID_PATTERN = re.compile(r"^task-[a-z0-9]{1,32}$")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def create_app(test_config: Optional[Dict[str, Any]] = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE_PATH=os.environ.get(
            "PROGRESS_DATABASE_PATH",
            str(Path(__file__).resolve().parent / "data" / "progress.db"),
        ),
        TOKEN_SHA256=os.environ.get("PROGRESS_TOKEN_SHA256", ""),
        ALLOWED_ORIGINS={
            origin.strip()
            for origin in os.environ.get(
                "PROGRESS_ALLOWED_ORIGINS",
                "https://jette0233.github.io,http://127.0.0.1:4173,http://localhost:4173",
            ).split(",")
            if origin.strip()
        },
        MAX_CONTENT_LENGTH=128 * 1024,
        MAX_PROGRESS_ITEMS=1000,
    )
    if test_config:
        app.config.update(test_config)

    if not app.config["TESTING"] and not app.config["TOKEN_SHA256"]:
        raise RuntimeError("PROGRESS_TOKEN_SHA256 must be configured")

    Path(app.config["DATABASE_PATH"]).parent.mkdir(parents=True, exist_ok=True)
    with app.app_context():
        init_database()

    @app.before_request
    def handle_preflight_and_auth():
        if request.method == "OPTIONS":
            return "", 204
        if request.path == "/health":
            return None

        authorization = request.headers.get("Authorization", "")
        token = authorization[7:].strip() if authorization.startswith("Bearer ") else ""
        supplied_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        if not token or not hmac.compare_digest(supplied_hash, current_app.config["TOKEN_SHA256"]):
            return jsonify(error="unauthorized"), 401
        return None

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin")
        if origin in current_app.config["ALLOWED_ORIGINS"]:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            response.headers["Access-Control-Allow-Methods"] = "GET, PUT, PATCH, OPTIONS"
            response.headers["Access-Control-Max-Age"] = "86400"
            response.headers["Vary"] = "Origin"
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @app.get("/health")
    def health():
        database = get_database()
        database.execute("SELECT 1").fetchone()
        return jsonify(status="ok")

    @app.get("/v1/progress")
    def get_progress():
        database = get_database()
        rows = database.execute(
            "SELECT task_id, completed, updated_at FROM progress ORDER BY task_id"
        ).fetchall()
        revision = get_revision(database)
        return jsonify(
            version=1,
            revision=revision,
            updatedAt=max((row["updated_at"] for row in rows), default=None),
            overrides={row["task_id"]: bool(row["completed"]) for row in rows},
        )

    @app.patch("/v1/progress/<task_id>")
    def update_task(task_id: str):
        if not TASK_ID_PATTERN.fullmatch(task_id):
            return jsonify(error="invalid_task_id"), 400
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict) or not isinstance(payload.get("completed"), bool):
            return jsonify(error="completed_must_be_boolean"), 400

        database = get_database()
        timestamp = utc_now()
        with database:
            database.execute(
                """
                INSERT INTO progress (task_id, completed, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(task_id) DO UPDATE SET
                    completed = excluded.completed,
                    updated_at = excluded.updated_at
                """,
                (task_id, int(payload["completed"]), timestamp),
            )
            revision = bump_revision(database)
        return jsonify(taskId=task_id, completed=payload["completed"], updatedAt=timestamp, revision=revision)

    @app.put("/v1/progress")
    def replace_progress():
        payload = request.get_json(silent=True)
        overrides = payload.get("overrides") if isinstance(payload, dict) else None
        if not isinstance(overrides, dict):
            return jsonify(error="overrides_must_be_object"), 400
        if len(overrides) > current_app.config["MAX_PROGRESS_ITEMS"]:
            return jsonify(error="too_many_progress_items"), 400

        normalized: Dict[str, bool] = {}
        for task_id, completed in overrides.items():
            if not isinstance(task_id, str) or not TASK_ID_PATTERN.fullmatch(task_id):
                return jsonify(error="invalid_task_id", taskId=str(task_id)), 400
            if not isinstance(completed, bool):
                return jsonify(error="completed_must_be_boolean", taskId=task_id), 400
            normalized[task_id] = completed

        database = get_database()
        timestamp = utc_now()
        with database:
            database.execute("DELETE FROM progress")
            database.executemany(
                "INSERT INTO progress (task_id, completed, updated_at) VALUES (?, ?, ?)",
                [(task_id, int(completed), timestamp) for task_id, completed in normalized.items()],
            )
            revision = bump_revision(database)
        return jsonify(updatedAt=timestamp, revision=revision, saved=len(normalized))

    @app.teardown_appcontext
    def close_database(_error=None):
        database = g.pop("database", None)
        if database is not None:
            database.close()

    return app


def get_database() -> sqlite3.Connection:
    if "database" not in g:
        database = sqlite3.connect(current_app.config["DATABASE_PATH"], timeout=5)
        database.row_factory = sqlite3.Row
        database.execute("PRAGMA foreign_keys = ON")
        database.execute("PRAGMA busy_timeout = 5000")
        g.database = database
    return g.database


def init_database() -> None:
    database = sqlite3.connect(current_app.config["DATABASE_PATH"], timeout=5)
    try:
        database.execute("PRAGMA journal_mode = WAL")
        database.execute("PRAGMA synchronous = NORMAL")
        database.executescript(
            """
            CREATE TABLE IF NOT EXISTS progress (
                task_id TEXT PRIMARY KEY,
                completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sync_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                revision INTEGER NOT NULL DEFAULT 0
            );

            INSERT OR IGNORE INTO sync_state (id, revision) VALUES (1, 0);
            """
        )
        database.commit()
    finally:
        database.close()


def get_revision(database: sqlite3.Connection) -> int:
    row = database.execute("SELECT revision FROM sync_state WHERE id = 1").fetchone()
    return int(row["revision"])


def bump_revision(database: sqlite3.Connection) -> int:
    database.execute("UPDATE sync_state SET revision = revision + 1 WHERE id = 1")
    return get_revision(database)
