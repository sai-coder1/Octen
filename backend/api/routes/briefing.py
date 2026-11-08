from fastapi import APIRouter, HTTPException
from backend.services.news_service import get_daily_news

router = APIRouter()


@router.get("/daily-briefing")
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
