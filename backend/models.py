"""Database models using SQLModel for the Todo application."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """User model - managed by Better Auth, read-only in backend.

    This table is created and managed by Better Auth on the frontend.
    The backend only reads from this table for foreign key relationships.
    """

    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    email_verified: bool = Field(default=False)
    name: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Task(SQLModel, table=True):
    """Task model for todo items.

    Each task belongs to a user and contains:
    - title: Required, max 200 characters
    - description: Optional, max 1000 characters
    - completed: Boolean status, defaults to False
    - Timestamps for creation and updates
    """

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def __repr__(self) -> str:
        status = "✓" if self.completed else "○"
        return f"<Task {self.id}: {status} {self.title}>"
