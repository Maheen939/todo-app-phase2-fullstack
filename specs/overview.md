# Todo App Phase II - Overview

**Version**: 2.0
**Date**: 2026-01-01
**Status**: In Progress
**Phase**: II - Full-Stack Web Application

## Purpose
Transform the Phase I console todo application into a modern multi-user web application with persistent storage, authentication, and RESTful API.

## Evolution Path
- **Phase I**: Console app with in-memory storage → File persistence ✓ Completed
- **Phase II**: Full-stack web app with PostgreSQL ← Current Phase
- **Phase III**: AI chatbot integration (Planned)

## Current Phase: Phase II - Full-Stack Web Application

### Objective
Using Claude Code and Spec-Kit Plus, transform the console app into a modern multi-user web application with persistent storage.

### Development Approach
**Agentic Dev Stack Workflow**:
1. Write spec
2. Generate plan
3. Break into tasks
4. Implement via Claude Code
5. No manual coding allowed

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16+ (App Router) |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Spec-Driven | Claude Code + Spec-Kit Plus |
| Authentication | Better Auth with JWT |
| Styling | Tailwind CSS |
| Language | TypeScript (Frontend), Python 3.13+ (Backend) |

## Core Features

### Basic Level Functionality
All 5 basic features from Phase I, now as a web application:

1. **Add Task** - Create tasks with title and description
2. **View Tasks** - List all user's tasks with status indicators
3. **Update Task** - Modify task details
4. **Delete Task** - Remove tasks
5. **Mark Complete/Incomplete** - Toggle task completion status

### Phase II Enhancements
- Multi-user support with authentication
- RESTful API architecture
- PostgreSQL persistent storage
- Responsive web interface
- User signup/signin with Better Auth
- JWT-based API security

## API Architecture

### Base URL
- Development: `http://localhost:8000`
- Production: TBD

### Authentication
All API endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all user tasks |
| POST | `/api/{user_id}/tasks` | Create a new task |
| GET | `/api/{user_id}/tasks/{id}` | Get task details |
| PUT | `/api/{user_id}/tasks/{id}` | Update a task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete a task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |

## Security Model

### Better Auth + FastAPI Integration

**The Challenge**: Better Auth is a JavaScript/TypeScript library running on Next.js frontend, but FastAPI backend needs to verify which user is making requests.

**The Solution**: JWT Tokens
1. User authenticates via Better Auth in Next.js
2. Better Auth issues JWT token
3. Frontend includes JWT in all API requests
4. FastAPI verifies JWT and extracts user_id
5. Backend filters all data by authenticated user_id

## Database Schema

### Tables
- **users** - Managed by Better Auth (id, email, name, created_at)
- **tasks** - User tasks (id, user_id, title, description, completed, timestamps)

### Data Isolation
- All tasks are associated with a user_id
- Users can only access their own tasks
- Backend enforces user isolation at API level

## User Interface

### Pages
- `/` - Landing page with login/signup
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/dashboard` - Main todo list interface
- `/tasks/[id]` - Task detail view (optional)

### Components
- TaskList - Display all tasks with filters
- TaskItem - Individual task card
- AddTaskForm - Create new task
- EditTaskModal - Update existing task
- AuthForm - Login/signup forms

## Development Environment

### Docker Compose Services
```yaml
services:
  frontend:  # Next.js on port 3000
  backend:   # FastAPI on port 8000
  postgres:  # PostgreSQL (for local dev)
```

### Environment Variables
```
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
BETTER_AUTH_SECRET=...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:3000
```

## Success Criteria

### Functional Requirements
- ✓ User can sign up and sign in
- ✓ User can perform all 5 CRUD operations on tasks
- ✓ Tasks persist in PostgreSQL database
- ✓ Users only see their own tasks
- ✓ Responsive UI works on mobile and desktop

### Technical Requirements
- ✓ RESTful API follows conventions
- ✓ JWT authentication works end-to-end
- ✓ Database schema properly indexed
- ✓ Frontend uses Next.js 16+ App Router
- ✓ Backend uses FastAPI + SQLModel
- ✓ Deployed to Neon PostgreSQL

### Spec-Driven Requirements
- ✓ All features implemented via Claude Code
- ✓ Specs written before implementation
- ✓ No manual coding
- ✓ Process documented for review

## Next Steps
1. Write detailed feature specifications
2. Design API endpoint contracts
3. Define database schema
4. Create UI wireframes/specs
5. Implement via Claude Code following Agentic Dev Stack workflow
