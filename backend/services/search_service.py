from backend.cache.lru_cache import LRUCache

from backend.core.config import OCTEN_API_KEY
from octen import Octen
import logging
import time

logger = logging.getLogger(__name__)
search_cache = LRUCache(100)
api_attempts = 0


def get_search_stats():
    return {"cache": search_cache.get_stats(), "api_attempts": api_attempts}


def extract_image_url(item: dict) -> str | None:
    """Extract an article image or thumbnail URL from an Octen result."""
    if not isinstance(item, dict):
        return None
    if item.get("image_url"):
        return item["image_url"]

    cover = item.get("cover_image")
    if isinstance(cover, dict) and cover.get("url"):
        return cover["url"]
    elif isinstance(cover, str) and cover.strip():
        return cover.strip()

    images = item.get("images")
    if isinstance(images, list) and len(images) > 0:
        first = images[0]
        if isinstance(first, dict) and first.get("url"):
            return first["url"]
        elif isinstance(first, str) and first.strip():
            return first.strip()

    return None


def search_web(query: str, count: int = 3) -> list:
    """Search the web through Octen and return the results."""

    if not query or not query.strip():
        raise ValueError("Search query cannot be empty.")

        # Ensure count is an integer, not a Boolean (True/False),
        # because Python treats Booleans as a subclass of integers.
    if not isinstance(count, int) or isinstance(count, bool) or not 1 <= count <= 10:
        raise ValueError("Count must be an integer between 1 and 10.")

    cache_key = (query.strip().lower(), count)
    cached_results = search_cache.get(cache_key)

    if cached_results is not None:
        logger.info("CACHE HIT")
        return cached_results

    logger.info("CACHE MISS - Calling Octen API")

    for attempt in range(3):
        try:
            with Octen(api_key=OCTEN_API_KEY, timeout=10.0, max_retries=2) as client:
                global api_attempts
                api_attempts += 1
                response = client.search.search(
                    query=query, count=count, timeout=10.0, include_images=True
                )
                results = []
                for item in response.results:
                    if isinstance(item, dict):
                        item["image_url"] = extract_image_url(item)
                    results.append(item)
                search_cache.put(cache_key, results)
            return results
        except Exception:

            logger.exception("Octen API search failed")
            raise
