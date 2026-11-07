from fastapi.middleware.cors import CORSMiddleware

# Import FastAPI to create the API application.#
from fastapi import FastAPI, HTTPException, Query

from backend.services.search_service import search_web
from backend.services.news_service import get_daily_news
import logging
from backend.logging_config import setup_logging

setup_logging()

logger = logging.getLogger(__name__)
logger.info("ResearchMate application started")
app = FastAPI(title="AI Research Assistant")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "AI Research Assistant API is running!"}


@app.get("/search")
def search(
    q: str = Query(..., min_length=1, description="Topic to research"),
    count: int = Query(3, ge=1, le=10, description="Number of results"),
):
    try:
        results = search_web(q, count)
        return {"query": q, "count": len(results), "results": results}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.get("/daily-briefing")
def daily_briefing():
    try:
        briefing = get_daily_news()

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
