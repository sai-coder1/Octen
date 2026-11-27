from fastapi.testclient import TestClient
from backend.main import app
from unittest.mock import patch
from octen.core.exceptions import OctenRateLimitError

from unittest.mock import MagicMock
from backend.services import search_service
from backend.cache.lru_cache import LRUCache

client = TestClient(app)


def test_empty_search_query():
    response = client.get("/search", params={"q": ""})

    assert response.status_code == 422


def test_invalid_search_count():
    response = client.get(
        "/search", params={"q": "artificial intelligence", "count": 15}
    )

    assert response.status_code == 422


#   assert checks whether the condition is true/false  #


@patch("backend.api.routes.search.search_web")
def test_successful_search(mock_search):
    mock_search.return_value = [
        {
            "title": "AI Research",
            "url": "https://example.com",
            "highlight": "Artificial intelligence research",
            "favicon": None,
        }
    ]
    response = client.get(
        "/search", params={"q": "artificial intelligence", "count": 3}
    )

    assert response.status_code == 200

    data = response.json()

    assert data["query"] == "artificial intelligence"
    assert data["count"] == 1
    assert len(data["results"]) == 1
    assert data["results"][0]["title"] == "AI Research"

    mock_search.assert_called_once()


@patch("backend.api.routes.search.search_web")
def test_rate_limit_error(mock_search):
    mock_search.side_effect = OctenRateLimitError()

    response = client.get(
        "/search", params={"q": "artificial intelligence", "count": 3}
    )

    assert response.status_code == 429

    assert response.json()["detail"] == (
        "Search service rate limit reached. Please try again shortly."
    )

    mock_search.assert_called_once()


@patch("backend.api.routes.search.search_web")
def test_auth_error(mock_search):
    from octen.core.exceptions import OctenAuthenticationError

    mock_search.side_effect = OctenAuthenticationError()

    response = client.get(
        "/search", params={"q": "artificial intelligence", "count": 3}
    )

    assert response.status_code == 502
    assert "authentication error" in response.json()["detail"].lower()


@patch("backend.api.routes.search.search_web")
def test_timeout_error(mock_search):
    from octen.core.exceptions import OctenTimeoutError

    mock_search.side_effect = OctenTimeoutError()

    response = client.get(
        "/search", params={"q": "artificial intelligence", "count": 3}
    )

    assert response.status_code == 504
    assert "unable to connect" in response.json()["detail"].lower()


def test_search_uses_cache(monkeypatch):
    # Give this test a fresh cache
    monkeypatch.setattr(search_service, "search_cache", LRUCache(100))

    # Create a mock Octen client
    mock_octen = MagicMock()
    mock_client = MagicMock()

    mock_octen.return_value.__enter__.return_value = mock_client

    # Fake API response
    expected_results = [
        {
            "title": "AI Research",
            "url": "https://example.com",
            "highlight": "Artificial intelligence research",
            "favicon": None,
        }
    ]

    mock_response = MagicMock()
    mock_response.results = expected_results

    mock_client.search.search.return_value = mock_response

    # Replace real Octen with our mock
    monkeypatch.setattr(search_service, "Octen", mock_octen)

    # First search
    first_result = search_service.search_web("artificial intelligence", 3)

    # Second identical search
    second_result = search_service.search_web("artificial intelligence", 3)

    # Verify results
    assert first_result == expected_results
    assert second_result == expected_results

    # Octen should be called only once
    mock_octen.assert_called_once()
    mock_client.search.search.assert_called_once()
