import hashlib
import tempfile
import unittest
from pathlib import Path

from backend.app import create_app


class ProgressApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.token = "test-sync-key"
        self.origin = "https://jette0233.github.io"
        self.app = create_app(
            {
                "TESTING": True,
                "DATABASE_PATH": str(Path(self.temporary_directory.name) / "progress.db"),
                "TOKEN_SHA256": hashlib.sha256(self.token.encode()).hexdigest(),
                "ALLOWED_ORIGINS": {self.origin},
            }
        )
        self.client = self.app.test_client()
        self.headers = {"Authorization": f"Bearer {self.token}", "Origin": self.origin}

    def tearDown(self):
        self.temporary_directory.cleanup()

    def test_health_does_not_require_authentication(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"status": "ok"})

    def test_progress_requires_valid_token(self):
        self.assertEqual(self.client.get("/v1/progress").status_code, 401)
        self.assertEqual(
            self.client.get("/v1/progress", headers={"Authorization": "Bearer wrong"}).status_code,
            401,
        )

    def test_patch_and_get_progress(self):
        response = self.client.patch(
            "/v1/progress/task-abc123",
            json={"completed": True},
            headers=self.headers,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["revision"], 1)

        response = self.client.get("/v1/progress", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["overrides"], {"task-abc123": True})
        self.assertEqual(response.headers["Access-Control-Allow-Origin"], self.origin)

    def test_replace_progress_is_transactional(self):
        response = self.client.put(
            "/v1/progress",
            json={"overrides": {"task-one": True, "task-two": False}},
            headers=self.headers,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["saved"], 2)

        invalid = self.client.put(
            "/v1/progress",
            json={"overrides": {"invalid id": True}},
            headers=self.headers,
        )
        self.assertEqual(invalid.status_code, 400)

        response = self.client.get("/v1/progress", headers=self.headers)
        self.assertEqual(response.json["overrides"], {"task-one": True, "task-two": False})

    def test_preflight_allows_configured_origin(self):
        response = self.client.options(
            "/v1/progress",
            headers={
                "Origin": self.origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.headers["Access-Control-Allow-Origin"], self.origin)


if __name__ == "__main__":
    unittest.main()
