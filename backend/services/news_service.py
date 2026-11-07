from backend.services.search_service import search_web


def get_daily_news() -> dict:
    """Fetch news for the daily ResearchMate briefing."""

    categories = {
        "AI & Research": "latest artificial intelligence news and research",
        "Global Tech": "latest global technology and startup news",
        "Developer News": "latest software development and programming news",
        "Jobs & Internships": (
            "software engineering internships and student job openings 2026"
        ),
    }

    briefing = {}

    for category, query in categories.items():
        briefing[category] = search_web(query, count=3)

    return briefing
