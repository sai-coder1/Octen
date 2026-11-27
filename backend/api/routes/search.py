import logging
from fastapi import APIRouter, HTTPException, Query
from backend.services.search_service import search_web
from backend.schemas.search import SearchResponse
from octen.core.exceptions import (
    OctenRateLimitError,
    OctenAuthenticationError,
    OctenTimeoutError,
    OctenConnectionError,
    OctenAPIError,
    OctenError,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/search", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1, description="Topic to research"),
    count: int = Query(3, ge=1, le=10, description="Number of results"),
):
    try:
        results = search_web(q, count)
        return {"query": q, "count": len(results), "results": results}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except OctenRateLimitError:
        logger.warning("Octen API rate limit reached (HTTP 429)")
        raise HTTPException(
            status_code=429,
            detail="Search service rate limit reached. Please try again shortly.",
        )
    except OctenAuthenticationError:
        logger.error("Octen API authentication failed (HTTP 401)")
        raise HTTPException(
            status_code=502,
            detail="Search service authentication error. Please verify API configuration.",
        )
    except (OctenTimeoutError, OctenConnectionError):
        logger.error("Octen service connection or timeout failure")
        raise HTTPException(
            status_code=504,
            detail="Unable to connect to the research intelligence service. Please try again shortly.",
        )
    except OctenAPIError as api_err:
        status = api_err.status_code or 502
        logger.error("Octen API error occurred (status: %s)", status)
        if status == 403:
            raise HTTPException(
                status_code=502,
                detail="Access forbidden by research intelligence service.",
            )
        raise HTTPException(
            status_code=502,
            detail=f"Research intelligence service error (Status {status}).",
        )
    except OctenError as octen_err:
        logger.error("Octen SDK error: %s", octen_err)
        raise HTTPException(
            status_code=502,
            detail="Research intelligence service encountered an unexpected error.",
        )
