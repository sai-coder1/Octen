from fastapi import APIRouter, HTTPException, Query
from backend.services.search_service import search_web

router = APIRouter()


@router.get("/search")
def search(
    q: str = Query(..., min_length=1, description="Topic to research"),
    count: int = Query(3, ge=1, le=10, description="Number of results"),
):
    try:
        results = search_web(q, count)
        return {"query": q, "count": len(results), "results": results}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
