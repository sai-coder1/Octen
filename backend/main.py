from fastapi.middleware.cors import CORSMiddleware

# Import FastAPI to create the API application.#
from fastapi import FastAPI

from backend.api.routes.search import router as search_router
from backend.api.routes.briefing import router as briefing_router
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


app.include_router(search_router)
app.include_router(briefing_router)
