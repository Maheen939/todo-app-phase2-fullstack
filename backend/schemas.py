"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """Schema for creating a new task.

    Attributes:
        title: Task title (required, 1-200 characters)
        description: Task description (optional, max 1000 characters)
    """

    title: str = Field(min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(
        default=None, max_length=1000, description="Task description (optional)"
    )


class TaskUpdate(BaseModel):
    """Schema for updating an existing task.

    Attributes:
        title: Updated task title (required, 1-200 characters)
        description: Updated task description (optional, max 1000 characters)
    """

    title: str = Field(min_length=1, max_length=200, description="Updated task title")
    description: Optional[str] = Field(
        default=None, max_length=1000, description="Updated task description (optional)"
    )


class TaskResponse(BaseModel):
    """Schema for task responses.

    Returns complete task information including metadata.
    """

    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for list of tasks with statistics.

    Returns tasks array plus aggregate counts.
    """

    tasks: list[TaskResponse]
    total: int = Field(description="Total number of tasks")
    pending: int = Field(description="Number of incomplete tasks")
    completed: int = Field(description="Number of completed tasks")


class ErrorResponse(BaseModel):
    """Standard error response format."""

    error: str = Field(description="Error type or title")
    detail: str = Field(description="Human-readable error message")
    field: Optional[str] = Field(default=None, description="Field name for validation errors")


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(description="Service status")
    timestamp: str = Field(description="Current server timestamp")
    version: str = Field(description="API version")
