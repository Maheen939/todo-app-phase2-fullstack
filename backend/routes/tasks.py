"""Task CRUD API endpoints."""

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from auth import verify_token, verify_user_access
from database import get_session
from models import Task
from schemas import TaskCreate, TaskListResponse, TaskResponse, TaskUpdate

router = APIRouter()


@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["tasks"],
)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session),
) -> Task:
    """Create a new task for the authenticated user.

    Args:
        user_id: User ID from URL (must match authenticated user)
        task_data: Task creation data (title and optional description)
        authenticated_user_id: User ID from JWT token
        session: Database session

    Returns:
        TaskResponse: The created task

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 400 if validation fails
    """
    # Verify user can only create tasks for themselves
    verify_user_access(user_id, authenticated_user_id)

    # Create new task
    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.get("/{user_id}/tasks", response_model=TaskListResponse, tags=["tasks"])
async def get_tasks(
    user_id: str,
    status_filter: Literal["all", "pending", "completed"] = Query("all", alias="status"),
    sort: Literal["created", "updated", "title"] = Query("created"),
    order: Literal["asc", "desc"] = Query("desc"),
    limit: int = Query(100, ge=1, le=100),
    offset: int = Query(0, ge=0),
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session),
) -> TaskListResponse:
    """Get all tasks for the authenticated user with filtering and sorting.

    Args:
        user_id: User ID from URL (must match authenticated user)
        status_filter: Filter by status (all/pending/completed)
        sort: Sort field (created/updated/title)
        order: Sort order (asc/desc)
        limit: Maximum number of tasks to return (1-100)
        offset: Number of tasks to skip for pagination
        authenticated_user_id: User ID from JWT token
        session: Database session

    Returns:
        TaskListResponse: List of tasks with statistics

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
    """
    # Verify user can only access their own tasks
    verify_user_access(user_id, authenticated_user_id)

    # Build base query
    query = select(Task).where(Task.user_id == user_id)

    # Apply status filter
    if status_filter == "pending":
        query = query.where(Task.completed == False)  # noqa: E712
    elif status_filter == "completed":
        query = query.where(Task.completed == True)  # noqa: E712

    # Apply sorting
    sort_field = {"created": Task.created_at, "updated": Task.updated_at, "title": Task.title}[
        sort
    ]

    if order == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

    # Apply pagination
    query = query.offset(offset).limit(limit)

    # Execute query
    tasks = list(session.exec(query).all())

    # Calculate statistics (across all tasks, not just paginated)
    all_tasks_query = select(Task).where(Task.user_id == user_id)
    all_tasks = list(session.exec(all_tasks_query).all())

    total = len(all_tasks)
    pending = sum(1 for t in all_tasks if not t.completed)
    completed = sum(1 for t in all_tasks if t.completed)

    return TaskListResponse(tasks=tasks, total=total, pending=pending, completed=completed)


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse, tags=["tasks"])
async def get_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session),
) -> Task:
    """Get a specific task by ID.

    Args:
        user_id: User ID from URL (must match authenticated user)
        task_id: Task ID to retrieve
        authenticated_user_id: User ID from JWT token
        session: Database session

    Returns:
        TaskResponse: The requested task

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found or belongs to different user
    """
    # Verify user can only access their own tasks
    verify_user_access(user_id, authenticated_user_id)

    # Get task
    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse, tags=["tasks"])
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session),
) -> Task:
    """Update a task's title and/or description.

    Args:
        user_id: User ID from URL (must match authenticated user)
        task_id: Task ID to update
        task_data: Updated task data (title and description)
        authenticated_user_id: User ID from JWT token
        session: Database session

    Returns:
        TaskResponse: The updated task

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found
        HTTPException: 400 if validation fails
    """
    # Verify user can only update their own tasks
    verify_user_access(user_id, authenticated_user_id)

    # Get task
    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Update task
    task.title = task_data.title
    task.description = task_data.description
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse, tags=["tasks"])
async def toggle_task_complete(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session),
) -> Task:
    """Toggle task completion status.

    Args:
        user_id: User ID from URL (must match authenticated user)
        task_id: Task ID to toggle
        authenticated_user_id: User ID from JWT token
        session: Database session

    Returns:
        TaskResponse: The updated task

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found
    """
    # Verify user can only modify their own tasks
    verify_user_access(user_id, authenticated_user_id)

    # Get task
    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Toggle completion status
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete(
    "/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["tasks"]
)
async def delete_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session),
) -> None:
    """Delete a task permanently.

    Args:
        user_id: User ID from URL (must match authenticated user)
        task_id: Task ID to delete
        authenticated_user_id: User ID from JWT token
        session: Database session

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found
    """
    # Verify user can only delete their own tasks
    verify_user_access(user_id, authenticated_user_id)

    # Get task
    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Delete task
    session.delete(task)
    session.commit()
