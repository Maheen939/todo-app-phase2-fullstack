"""FastAPI application entry point for Todo API."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables
from routes import health, tasks

# Create FastAPI application
app = FastAPI(
    title="Todo API",
    version="2.0.0",
    description="RESTful API for Todo application with multi-user support and JWT authentication",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware configuration
# Allows the Next.js frontend to make requests to the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://127.0.0.1:3000",  # Alternative localhost
        # Add production frontend URL here when deploying
    ],
    allow_credentials=True,  # Allow cookies and authorization headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include route handlers
app.include_router(health.router)  # Health check endpoint (no /api prefix)
app.include_router(tasks.router, prefix="/api", tags=["tasks"])  # Task endpoints under /api


@app.on_event("startup")
async def on_startup() -> None:
    """Run on application startup.

    Creates database tables if they don't exist.
    Note: Better Auth tables are created by Better Auth on frontend.
    """
    print("Starting Todo API...")
    print("Creating database tables...")
    create_db_and_tables()
    print("Database tables created successfully!")
    print("API is ready to accept requests.")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    """Run on application shutdown."""
    print("Shutting down Todo API...")


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    """Root endpoint.

    Returns:
        dict: Welcome message and API information
    """
    return {
        "message": "Todo API v2.0",
        "docs": "/docs",
        "health": "/health",
    }


# For development/testing
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info",
    )
