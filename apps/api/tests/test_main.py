"""Basic PyTest test suite for AeroHire API."""
import pytest
from fastapi.testclient import TestClient

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

client = TestClient(app)


def test_health_check():
    """API health endpoint returns operational status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["service"] == "AeroHire API"


def test_register_missing_body():
    """Register endpoint rejects missing body."""
    response = client.post("/auth/register", json={})
    assert response.status_code == 422


def test_login_missing_body():
    """Login endpoint rejects missing body."""
    response = client.post("/auth/login", json={})
    assert response.status_code == 422


def test_protected_route_without_token():
    """Protected routes return 403 without Bearer token."""
    response = client.get("/users/me")
    assert response.status_code == 403


def test_jobs_requires_auth():
    """Jobs route requires authentication."""
    response = client.get("/jobs")
    assert response.status_code == 403


def test_applications_requires_auth():
    """Applications route requires authentication."""
    response = client.get("/applications")
    assert response.status_code == 403
