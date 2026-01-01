# Backend Development Guidelines

## Stack
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT token verification
- **Language**: Python 3.13+
- **Package Manager**: UV

## Project Structure
```
backend/
├── main.py                 # FastAPI app entry point
├── models.py               # SQLModel database models
├── schemas.py              # Pydantic request/response schemas
├── database.py             # Database connection and session
├── auth.py                 # JWT verification dependency
├── routes/                 # API route handlers
│   ├── __init__.py
│   ├── tasks.py            # Task CRUD endpoints
│   └── health.py           # Health check endpoint
├── migrations/             # Alembic migrations
│   └── versions/
├── tests/                  # Unit and integration tests
├── .env                    # Environment variables
├── pyproject.toml          # UV project config
├── uv.lock
├── alembic.ini             # Alembic config
└── README.md
```

## Development Patterns

### FastAPI Application Structure

#### main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import tasks, health
from database import create_db_and_tables

app = FastAPI(
    title="Todo API",
    version="2.0",
    description="RESTful API for Todo application"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(tasks.router, prefix="/api", tags=["tasks"])

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()
```

### Database Models (SQLModel)

#### models.py
```python
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    """User model - managed by Better Auth, read-only here."""
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    email_verified: bool = Field(default=False)
    name: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Task(SQLModel, table=True):
    """Task model for todo items."""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = None
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Request/Response Schemas

#### schemas.py
```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    """Schema for creating a task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)

class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)

class TaskResponse(BaseModel):
    """Schema for task responses."""
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
    """Schema for list of tasks with stats."""
    tasks: list[TaskResponse]
    total: int
    pending: int
    completed: int
```

### Database Connection

#### database.py
```python
from sqlmodel import create_engine, SQLModel, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False  # Set to True for SQL logging
)

def create_db_and_tables():
    """Create database tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for database sessions."""
    with Session(engine) as session:
        yield session
```

### JWT Authentication

#### auth.py
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

security = HTTPBearer()

def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify JWT token and extract user_id.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        user_id: The authenticated user's ID

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

### API Route Handlers

#### routes/tasks.py
```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import Literal
from database import get_session
from auth import verify_token
from models import Task
from schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from datetime import datetime

router = APIRouter()

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Create a new task."""
    # Verify user_id matches authenticated user
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create tasks for another user"
        )

    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.get("/{user_id}/tasks", response_model=TaskListResponse)
async def get_tasks(
    user_id: str,
    status_filter: Literal["all", "pending", "completed"] = Query("all", alias="status"),
    sort: Literal["created", "updated", "title"] = Query("created"),
    order: Literal["asc", "desc"] = Query("desc"),
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Get all tasks for user with filtering and sorting."""
    # Verify user_id matches authenticated user
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    # Build query
    query = select(Task).where(Task.user_id == user_id)

    # Apply status filter
    if status_filter == "pending":
        query = query.where(Task.completed == False)
    elif status_filter == "completed":
        query = query.where(Task.completed == True)

    # Apply sorting
    sort_field = {
        "created": Task.created_at,
        "updated": Task.updated_at,
        "title": Task.title
    }[sort]

    if order == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

    tasks = session.exec(query).all()

    # Calculate stats
    total = len(tasks)
    pending = sum(1 for t in tasks if not t.completed)
    completed = sum(1 for t in tasks if t.completed)

    return TaskListResponse(
        tasks=tasks,
        total=total,
        pending=pending,
        completed=completed
    )

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Get a specific task by ID."""
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Update a task's title and/or description."""
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update another user's tasks"
        )

    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.title = task_data.title
    task.description = task_data.description
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_complete(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Toggle task completion status."""
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify another user's tasks"
        )

    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Delete a task."""
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another user's tasks"
        )

    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    session.delete(task)
    session.commit()

    return None
```

#### routes/health.py
```python
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0"
    }
```

## API Conventions

### All Routes Under `/api/`
```python
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
```

### Return JSON Responses
Use Pydantic models for automatic JSON serialization:
```python
@router.get("/tasks", response_model=TaskListResponse)
```

### Handle Errors with HTTPException
```python
if not task:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Task not found"
    )
```

### Use Type Hints
```python
async def get_tasks(
    user_id: str,
    session: Session = Depends(get_session)
) -> TaskListResponse:
    ...
```

## Database Operations

### Use SQLModel for All Operations
```python
# Query
tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()

# Get by ID
task = session.get(Task, task_id)

# Create
task = Task(user_id=user_id, title="New task")
session.add(task)
session.commit()
session.refresh(task)

# Update
task.title = "Updated title"
session.add(task)
session.commit()

# Delete
session.delete(task)
session.commit()
```

### Never Concatenate SQL Strings
SQLModel handles parameterization automatically. Never do:
```python
# ❌ NEVER DO THIS
query = f"SELECT * FROM tasks WHERE user_id = '{user_id}'"
```

## Security Requirements

### Always Verify JWT Token
```python
authenticated_user_id: str = Depends(verify_token)
```

### Always Check user_id Matches
```python
if user_id != authenticated_user_id:
    raise HTTPException(status_code=403, detail="Forbidden")
```

### Filter All Queries by user_id
```python
# ✅ Correct - filtered by user
tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()

# ❌ WRONG - returns all users' tasks
tasks = session.exec(select(Task)).all()
```

## Environment Variables

### .env File
```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/database?sslmode=require
JWT_SECRET=same-as-better-auth-secret
JWT_ALGORITHM=HS256
```

### Usage
```python
import os

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET")
```

## Running the Application

### Development
```bash
# Install dependencies
uv sync

# Run server
uvicorn main:app --reload --port 8000

# Server runs on http://localhost:8000
```

### With UV
```bash
uv run uvicorn main:app --reload
```

### Database Migrations
```bash
# Initialize Alembic
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Testing

### Unit Tests (pytest)
```python
# tests/test_tasks.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_task_without_auth():
    response = client.post("/api/user-123/tasks", json={
        "title": "Test task"
    })
    assert response.status_code == 401
```

### Run Tests
```bash
pytest
```

## API Documentation

FastAPI generates automatic docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Error Handling Best Practices

### Return Appropriate Status Codes
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Valid token, wrong user
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

### Use HTTPException
```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Task not found"
)
```

## Logging

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/tasks")
async def create_task(...):
    logger.info(f"Creating task for user {user_id}")
    ...
```

## Dependencies Pattern

```python
from fastapi import Depends

def get_current_user(token: str = Depends(verify_token)) -> str:
    return token

@router.get("/tasks")
async def get_tasks(
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    ...
```

## Spec References
When implementing features, reference these specs:
- Features: `@specs/features/task-crud.md`, `@specs/features/authentication.md`
- API: `@specs/api/rest-endpoints.md`
- Database: `@specs/database/schema.md`

## Common Patterns Summary

| Task | Pattern |
|------|---------|
| Route Handler | `@router.get("/endpoint")` |
| Auth Check | `Depends(verify_token)` |
| Database Session | `Depends(get_session)` |
| Validation | Pydantic models (`TaskCreate`, etc.) |
| Error Handling | `raise HTTPException(...)` |
| Logging | `logger.info(...)` |

## Best Practices
1. Use dependency injection for session and auth
2. Always verify JWT tokens on protected routes
3. Filter all queries by user_id
4. Use Pydantic models for validation
5. Return appropriate HTTP status codes
6. Handle errors with HTTPException
7. Log important operations
8. Use type hints everywhere
9. Write tests for all endpoints
10. Never expose other users' data
