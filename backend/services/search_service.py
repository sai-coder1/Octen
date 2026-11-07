from backend.cache.lru_cache import LRUCache


import os
from dotenv import load_dotenv
from octen import Octen
import logging

# Load configuration from the project's .env file
load_dotenv()

logger = logging.getLogger(__name__)
search_cache = LRUCache(100)


def search_web(query: str, count: int = 3) -> list:
    """Search the web through Octen and return the results."""

    api_key = os.getenv("OCTEN_API_KEY")

    if not query or not query.strip():
        raise ValueError("Search query cannot be empty.")

        # Ensure count is an integer, not a Boolean (True/False),
        # because Python treats Booleans as a subclass of integers.
    if not isinstance(count, int) or isinstance(count, bool) or not 1 <= count <= 10:
        raise ValueError("Count must be an integer between 1 and 10.")

    if not api_key:
        raise ValueError("OCTEN_API_KEY is missing from .env")

    cache_key = (query.strip().lower(), count)
    cached_results = search_cache.get(cache_key)

    if cached_results is not None:
        logger.info("CACHE HIT")
        return cached_results

    logger.info("CACHE MISS - Calling Octen API")
    try:
        with Octen(api_key=api_key) as client:
            response = client.search.search(query=query, count=count)
            search_cache.put(cache_key, response.results)
        return response.results
    except Exception:
        logger.exception("Octen API search failed")
        raise
