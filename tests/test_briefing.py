from fastapi.testclient import TestClient
from unittest.mock import patch
from backend.main import app

client = TestClient(app)


@patch("backend.services.news_service.search_web")
def test_default_daily_briefing(mock_search):
    mock_search.return_value = [
        {"title": "Sample Article", "url": "https://example.com", "highlight": "Highlight"}
    ]

    response = client.get("/daily-briefing")
    assert response.status_code == 200

    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) == 4
    assert "AI & Research" in data["categories"]
    assert "Global Tech" in data["categories"]
    assert "Developer News" in data["categories"]
    assert "Jobs & Internships" in data["categories"]
    assert data["total_articles"] == 4


@patch("backend.services.news_service.search_web")
def test_personalized_daily_briefing_valid(mock_search):
    mock_search.return_value = [
        {"title": "Tech Breakthrough", "url": "https://example.com/tech", "highlight": "Summary"}
    ]

    valid_topics = [
        "Artificial Intelligence",
        "Quantum Computing",
        "Biotechnology & Genomics",
        "Autonomous Systems"
    ]

    response = client.get("/daily-briefing", params={"topics": valid_topics})
    assert response.status_code == 200

    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) == 4
    for topic in valid_topics:
        assert topic in data["categories"]
    assert data["total_articles"] == 4


def test_personalized_daily_briefing_invalid_count():
    # Only 3 topics provided instead of 4
    invalid_topics = [
        "Artificial Intelligence",
        "Quantum Computing",
        "Biotechnology & Genomics"
    ]

    response = client.get("/daily-briefing", params={"topics": invalid_topics})
    assert response.status_code == 400
    assert "Exactly four topics must be selected" in response.json()["detail"]


def test_personalized_daily_briefing_duplicate_topics():
    # 4 topics but duplicates
    duplicate_topics = [
        "Artificial Intelligence",
        "Artificial Intelligence",
        "Quantum Computing",
        "Biotechnology & Genomics"
    ]

    response = client.get("/daily-briefing", params={"topics": duplicate_topics})
    assert response.status_code == 400
    assert "Selected topics must be unique" in response.json()["detail"]


def test_personalized_daily_briefing_unapproved_topic():
    # Arbitrary unapproved topic
    unapproved_topics = [
        "Artificial Intelligence",
        "Quantum Computing",
        "Biotechnology & Genomics",
        "Random Fabricated Topic"
    ]

    response = client.get("/daily-briefing", params={"topics": unapproved_topics})
    assert response.status_code == 400
    assert "not an approved topic" in response.json()["detail"]
