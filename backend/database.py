"""Database connection and session management."""

import os
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is required. "
        "Set it in .env file or environment."
    )

# Create engine with connection pooling (optimized for Neon serverless)
engine = create_engine(
    DATABASE_URL,
    pool_size=2,  # Keep low for serverless databases
    max_overflow=5,  # Limited overflow for serverless
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=300,  # Recycle connections every 5 minutes
    connect_args={"connect_timeout": 10},  # 10 second timeout
    echo=False,  # Set to True for SQL query logging (useful for debugging)
)


def create_db_and_tables() -> None:
    """Create all database tables.

    This creates tables defined in models.py using SQLModel metadata.
    Note: Better Auth tables (users, accounts, sessions, etc.) are created
    by Better Auth on the frontend, not here.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency for database sessions.

    Yields a SQLModel session that automatically closes after use.
    Use this as a FastAPI dependency with Depends(get_session).

    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        yield session
