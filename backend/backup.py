from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


database_path = Path(os.environ.get("PROGRESS_DATABASE_PATH", "/opt/ict-progress/backend/data/progress.db"))
backup_directory = Path("/opt/ict-progress/backups")
backup_directory.mkdir(parents=True, exist_ok=True)
timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
backup_path = backup_directory / f"progress-{timestamp}.db"

with sqlite3.connect(database_path) as source, sqlite3.connect(backup_path) as destination:
    source.backup(destination)

cutoff = datetime.now(timezone.utc).timestamp() - 30 * 24 * 60 * 60
for candidate in backup_directory.glob("progress-*.db"):
    if candidate.stat().st_mtime < cutoff:
        candidate.unlink()

print(backup_path)
