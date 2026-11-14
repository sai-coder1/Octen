from fastapi import APIRouter, HTTPException, Query
from backend.services.search_service import search_web, get_search_stats

router = APIRouter()


@router.get("/stats")
def get_stats():
    return get_search_stats()
