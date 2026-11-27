from pydantic import BaseModel


# BaseModel provides data validation and structure.
class SearchResult(BaseModel):

    # Title of the webpage (must be a string).
    title: str

    # URL of the webpage.
    url: str

    # Short excerpt of the search result.
    highlight: str

    # Cleaned narrative summary/excerpt (preserves original meaning)
    summary: str | None = None

    # Description alias for frontend compatibility
    description: str | None = None

    # Favicon is optional; defaults to None if missing.
    favicon: str | None = None

    # Article image or thumbnail URL; defaults to None if missing.
    image_url: str | None = None

    # Publication date/time if available
    time_published: str | None = None

    # Author/byline if available
    authors: str | None = None


class SearchResponse(BaseModel):
    query: str
    count: int
    results: list[SearchResult]  # it is the list of search Response objects
