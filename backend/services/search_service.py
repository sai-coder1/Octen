from backend.cache.lru_cache import LRUCache

from backend.core.config import OCTEN_API_KEY
from octen import Octen
import logging
import re
import time

logger = logging.getLogger(__name__)
search_cache = LRUCache(100)
api_attempts = 0


def get_search_stats():
    return {"cache": search_cache.get_stats(), "api_attempts": api_attempts}


def is_similar_to_title(line: str, title: str) -> bool:
    """Check if a line matches or heavily duplicates the article title/headline."""
    if not line or not title:
        return False

    # Strip publisher suffixes like ' | AP News', ' - Business Insider', etc.
    cleaned_title = re.sub(r"\s*[|\-–—]\s*[^|\-–—]+$", "", title.strip())

    norm_line = re.sub(r"[^a-zA-Z0-9]", "", line).lower()
    norm_title = re.sub(r"[^a-zA-Z0-9]", "", cleaned_title).lower()

    if not norm_line or not norm_title:
        return False

    if norm_line == norm_title:
        return True

    if len(norm_line) > 15 and (norm_line in norm_title or norm_title in norm_line):
        return True

    # Token overlap check (ignoring stop words)
    title_words = set(re.findall(r"\w+", cleaned_title.lower()))
    line_words = set(re.findall(r"\w+", line.lower()))
    stop_words = {"a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is", "says", "say"}
    sig_title = title_words - stop_words
    sig_line = line_words - stop_words

    if sig_title and sig_line:
        overlap = len(sig_title & sig_line)
        if (overlap / len(sig_line)) >= 0.7:
            return True

    return False


def is_metadata_or_caption(line: str) -> bool:
    """Identify author bylines, timestamps, photo credits, and crawler artifacts."""
    if not line:
        return True

    # Bylines
    if re.match(r"^(?:by|author|written by|posted by)\s+[\w\s\.\-]+$", line, re.IGNORECASE):
        return True

    # Standalone ISO timestamps / dates
    if re.match(r"^\d{4}-\d{2}-\d{2}(?:T|\s).*", line):
        return True

    # Photo and agency credits
    if re.search(r"(?:getty images|icon sportswire|ap photo|reuters|afp|photo by)\b", line, re.IGNORECASE):
        return True

    # Reading duration or short metadata tags
    if re.match(r"^(?:min read|read time|\d+\s*(?:min|mins|sec)\b)", line, re.IGNORECASE):
        return True

    return False


def clean_article_summary(highlight: str | None, title: str = "", max_chars: int = 350) -> str:
    """Extract a clean, readable excerpt from an article's raw crawler highlight text.

    Preserves original meaning without describing it as an AI-generated summary.
    Removes duplicated headlines, markdown images, bylines, timestamps, and crawler separators.
    """
    if not highlight or not isinstance(highlight, str):
        return ""

    text = highlight.strip()
    if not text:
        return ""

    # Discard raw JSON error payloads
    if text.startswith("{") and any(k in text for k in ['"error"', '"message"', '"status_code"', '"detail"']):
        return ""

    # Strip markdown images (![alt](url))
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    # Strip markdown links formatting ([text](url) -> text)
    text = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", text)
    # Strip raw HTML tags
    text = re.sub(r"<[^>]+>", "", text)

    # Split by major crawler discontinuity dividers (\n\n ... \n\n or standalone ...)
    # The first continuous segment represents the primary lead of the article.
    segments = re.split(r"(?:[\r\n]+\s*\.\.\.\s*[\r\n]+|[\r\n]{2,}\s*\.\.\.)", text)

    clean_paragraphs = []

    for segment in segments:
        raw_lines = re.split(r"[\r\n]+", segment)
        for line in raw_lines:
            line = line.strip()
            # Drop standalone ellipses
            if not line or line in ("...", "…", ". . ."):
                continue
            line = re.sub(r"^\s*[\.]{3,}\s*", "", line).strip()
            line = re.sub(r"\s*[\.]{3,}\s*$", "", line).strip()
            if not line or len(line) < 10:
                continue

            # Check if this line repeats the title/headline
            if title and is_similar_to_title(line, title):
                continue

            # Check if line is metadata, author byline, or photo credit
            if is_metadata_or_caption(line):
                continue

            clean_paragraphs.append(line)

        # Once we have a strong lead excerpt (> 180 chars), avoid stitching distant segments
        current_len = sum(len(p) for p in clean_paragraphs)
        if current_len >= 180:
            break

    if not clean_paragraphs:
        return ""

    # Combine paragraphs into clean prose
    content = " ".join(clean_paragraphs)
    content = re.sub(r"\s*\.\.\.\s*", " ", content)
    content = re.sub(r"\s+", " ", content).strip()

    if len(content) <= max_chars:
        return content

    truncated = content[:max_chars]
    # Prefer ending cleanly at a complete sentence boundary
    last_period = max(truncated.rfind(". "), truncated.rfind("! "), truncated.rfind("? "))
    if last_period > 160:
        return truncated[:last_period + 1].strip()

    # Otherwise cut at last whole word and add clean ellipsis
    last_space = truncated.rfind(" ")
    if last_space > 0:
        return truncated[:last_space].rstrip(".,;:-") + "..."
    return truncated + "..."


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
                        clean_excerpt = clean_article_summary(
                            item.get("highlight"),
                            item.get("title", "")
                        )
                        item["summary"] = clean_excerpt
                        item["description"] = clean_excerpt
                        item["highlight"] = clean_excerpt
                    results.append(item)
                search_cache.put(cache_key, results)
            return results
        except Exception:
            logger.exception("Octen API search failed")
            raise
