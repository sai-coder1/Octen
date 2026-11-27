from typing import List, Optional
from backend.services.search_service import search_web

# 12 Canonical Approved Topics and their targeted research queries
APPROVED_TOPICS = {
    "Artificial Intelligence": "latest artificial intelligence news and research breakthroughs",
    "Machine Learning": "machine learning research papers architectures and benchmarks",
    "Large Language Models": "large language models generative AI LLM advancements",
    "Robotics & Automation": "robotics humanoid robots automation technologies developments",
    "Quantum Computing": "quantum computing quantum algorithms hardware breakthroughs",
    "Cybersecurity & Cryptography": "cybersecurity vulnerabilities cryptography zero day threats",
    "Biotechnology & Genomics": "biotechnology genomics CRISPR computational biology news",
    "Autonomous Systems": "autonomous vehicles self driving navigation robotics systems",
    "Cloud & Distributed Systems": "cloud computing distributed systems kubernetes infrastructure",
    "Semiconductors & Hardware": "semiconductors microchips AI hardware GPU architecture news",
    "Developer Tools & Platforms": "software developer tools programming frameworks platforms",
    "Global Technology Trends": "global technology trends startup intelligence industry news",
}

DEFAULT_CATEGORIES = {
    "AI & Research": "latest artificial intelligence news and research",
    "Global Tech": "latest global technology and startup news",
    "Developer News": "latest software development and programming news",
    "Jobs & Internships": (
        "software engineering internships and student job openings 2026"
    ),
}


def get_daily_news(topics: Optional[List[str]] = None) -> dict:
    """Fetch news for the daily ResearchMate briefing, optionally personalized by 4 approved topics."""
    if topics is not None:
        if len(topics) != 4:
            raise ValueError("Exactly four topics must be selected.")
        if len(set(topics)) != 4:
            raise ValueError("Selected topics must be unique.")
        for topic in topics:
            if topic not in APPROVED_TOPICS:
                raise ValueError(
                    f"'{topic}' is not an approved topic. Approved topics: {', '.join(sorted(APPROVED_TOPICS.keys()))}"
                )

        selected_categories = {t: APPROVED_TOPICS[t] for t in topics}
    else:
        selected_categories = DEFAULT_CATEGORIES

    briefing = {}
    for category, query in selected_categories.items():
        briefing[category] = search_web(query, count=3)

    return briefing
