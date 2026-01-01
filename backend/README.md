# Todo API Backend

FastAPI backend for the Todo application with JWT authentication and PostgreSQL database.

## Features

- ✅ RESTful API with 7 endpoints
- ✅ JWT token authentication
- ✅ PostgreSQL database with SQLModel ORM
- ✅ Multi-user support with data isolation
- ✅ Automatic API documentation (Swagger/ReDoc)
- ✅ CORS configured for Next.js frontend
- ✅ Type-safe with Python type hints

## Technology Stack

- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT verification
- **Package Manager**: UV
- **Python**: 3.13+

## Quick Start

```bash
# Install dependencies
uv sync

# Create .env file
cp .env.example .env

# Edit .env with your DATABASE_URL and JWT_SECRET

# Run server
uv run uvicorn main:app --reload
```

Server runs on http://localhost:8000
API Docs: http://localhost:8000/docs

## API Endpoints

### Health Check
- `GET /health` - Check API status (no auth)

### Task Management (JWT auth required)
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks` - List tasks
- `GET /api/{user_id}/tasks/{id}` - Get task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle complete
- `DELETE /api/{user_id}/tasks/{id}` - Delete task

## See Full Documentation

Refer to `../README.md` for complete setup instructions and `CLAUDE.md` for development guidelines.
