# Todo App - Phase II Full-Stack Web Application

## Project Overview
This is a monorepo using Spec-Kit Plus for spec-driven development. Transforms the Phase I console app into a modern multi-user web application with persistent storage.

## Spec-Kit Structure
Specifications are organized in `/specs`:
- `/specs/overview.md` - Project overview
- `/specs/features/` - Feature specs (what to build)
- `/specs/api/` - API endpoint specs
- `/specs/database/` - Schema and model specs
- `/specs/ui/` - Component and page specs

## How to Use Specs
1. Always read relevant spec before implementing
2. Reference specs with: `@specs/features/task-crud.md`
3. Update specs if requirements change
4. Store spec history in `/specs-history/`

## Project Structure
```
todo-app-phase2-fullstack/
├── .spec-kit/          # Spec-Kit configuration
├── specs/              # All specifications
│   ├── overview.md
│   ├── features/       # Feature specifications
│   ├── api/            # API endpoint specs
│   ├── database/       # Schema specs
│   └── ui/             # UI specs
├── frontend/           # Next.js 16+ app
│   └── CLAUDE.md       # Frontend-specific instructions
├── backend/            # FastAPI server
│   └── CLAUDE.md       # Backend-specific instructions
├── docker-compose.yml  # Development environment
└── README.md
```

## Technology Stack
- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, SQLModel ORM
- **Database**: Neon Serverless PostgreSQL
- **Auth**: Better Auth with JWT tokens
- **Dev Tools**: Claude Code + Spec-Kit Plus

## Development Workflow
1. **Read spec**: `@specs/features/[feature].md`
2. **Implement backend**: `@backend/CLAUDE.md`
3. **Implement frontend**: `@frontend/CLAUDE.md`
4. **Test and iterate**

## Commands
```bash
# Frontend development
cd frontend && npm run dev

# Backend development
cd backend && uvicorn main:app --reload

# Both services with Docker
docker-compose up

# Database migrations
cd backend && alembic upgrade head
```

## Agentic Dev Stack Workflow
1. Write spec → Generate plan → Break into tasks → Implement via Claude Code
2. No manual coding allowed
3. Review process, prompts, and iterations

## Authentication Flow
Better Auth (Next.js) → JWT Token → FastAPI verification → Database access

## Current Phase
Phase II: Full-Stack Web Application with multi-user support and PostgreSQL persistence
