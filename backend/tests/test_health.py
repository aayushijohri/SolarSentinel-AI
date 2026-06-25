from fastapi.testclient import TestClient
import sys
import os

# Add the project root to sys.path so we can import 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.main import app

client = TestClient(app)

def test_health_check():
    """
    Verify the health check endpoint is operational.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "project" in data
    assert "version" in data
