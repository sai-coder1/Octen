from pydantic import BaseModel


# BaseModel provides data validation and structure.
class SearchResult(BaseModel):

    # Title of the webpage (must be a string).
    title: str

    # URL of the webpage.
    url: str

    # Short description of the search result.
    highlight: str

    # Favicon is optional; defaults to None if missing.
    favicon: str | None = None

    # Article image or thumbnail URL; defaults to None if missing.
    image_url: str | None = None


class SearchResponse(BaseModel):
    query: str
    count: int
    results: list[SearchResult]  # it is the list of search Response objects
