import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.services.news_service import get_daily_news
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


@router.get("/daily-briefing")
def daily_briefing(topics: Optional[List[str]] = Query(None)):
    try:
        briefing = get_daily_news(topics=topics)

        total_articles = sum(len(articles) for articles in briefing.values())

        return {
            "categories": briefing,
            "total_articles": total_articles,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error
    except OctenRateLimitError:
        logger.warning("Octen API rate limit reached in daily-briefing (HTTP 429)")
        raise HTTPException(
            status_code=429,
            detail="Research intelligence briefing rate limit reached. Please try again shortly.",
        )
    except OctenAuthenticationError:
        logger.error("Octen API authentication failed in daily-briefing (HTTP 401)")
        raise HTTPException(
            status_code=502,
            detail="Briefing service authentication error. Please verify API configuration.",
        )
    except (OctenTimeoutError, OctenConnectionError):
        logger.error("Octen service connection or timeout failure in daily-briefing")
        raise HTTPException(
            status_code=504,
            detail="Unable to connect to the research intelligence service. Please try again shortly.",
        )
    except OctenAPIError as api_err:
        status = api_err.status_code or 502
        logger.error("Octen API error occurred in daily-briefing (status: %s)", status)
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
        logger.error("Octen SDK error in daily-briefing: %s", octen_err)
        raise HTTPException(
            status_code=502,
            detail="Research intelligence service encountered an unexpected error.",
        )
