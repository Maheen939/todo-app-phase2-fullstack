"""Health check endpoint."""

from datetime import datetime

from fastapi import APIRouter

from schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Health check endpoint.

    Returns the current status of the API service.
    No authentication required.

    Returns:
        HealthResponse: Service status, timestamp, and version
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version="2.0",
    )
