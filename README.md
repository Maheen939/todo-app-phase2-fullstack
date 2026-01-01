# Todo App - Phase II: Full-Stack Web Application

A modern, multi-user todo application built with spec-driven development using Claude Code and Spec-Kit Plus.

## 🎯 Project Overview

**Phase II** transforms the Phase I console app into a production-ready web application with:
- User authentication
- RESTful API
- PostgreSQL persistence
- Responsive web interface

## 🏗️ Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Next.js    │   JWT   │   FastAPI    │  SQL    │  PostgreSQL  │
│  Frontend    │ ──────> │   Backend    │ ──────> │   Database   │
│  (Port 3000) │ <────── │  (Port 8000) │ <────── │  (Port 5432) │
└──────────────┘  JSON   └──────────────┘  Data   └──────────────┘
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16+ (App Router) | React framework with SSR |
| Backend | FastAPI | High-performance Python API |
| ORM | SQLModel | Type-safe database operations |
| Database | Neon Serverless PostgreSQL | Serverless PostgreSQL |
| Auth | Better Auth | Authentication with JWT |
| Styling | Tailwind CSS | Utility-first CSS |
| Dev Tools | Claude Code + Spec-Kit Plus | Spec-driven development |
| Package Manager (Frontend) | npm | Node.js packages |
| Package Manager (Backend) | UV | Fast Python package manager |

## ✨ Features

### Core Features
- ✅ **User Authentication** - Sign up, sign in, sign out with Better Auth
- ✅ **Task Management** - Create, read, update, delete tasks
- ✅ **Task Completion** - Mark tasks as complete/incomplete
- ✅ **Filtering** - View all, pending, or completed tasks
- ✅ **Sorting** - Sort by date, title, or last updated
- ✅ **Multi-user** - Each user sees only their own tasks
- ✅ **Persistent Storage** - Data stored in PostgreSQL
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

### Security Features
- JWT-based authentication
- Token verification on all API requests
- User data isolation (users can only access their own tasks)
- SQL injection prevention (SQLModel parameterized queries)
- CORS protection
- HTTPS in production

## 📁 Project Structure

```
todo-app-phase2-fullstack/
├── .spec-kit/              # Spec-Kit Plus configuration
│   └── config.yaml
├── specs/                  # Feature specifications
│   ├── overview.md
│   ├── features/           # What to build
│   │   ├── task-crud.md
│   │   └── authentication.md
│   ├── api/                # API contracts
│   │   └── rest-endpoints.md
│   ├── database/           # Schema design
│   │   └── schema.md
│   └── ui/                 # UI specifications
│       ├── pages.md
│       └── components.md
├── specs-history/          # Spec audit trail
├── frontend/               # Next.js application
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities & config
│   ├── types/              # TypeScript types
│   ├── CLAUDE.md           # Frontend dev guidelines
│   └── package.json
├── backend/                # FastAPI application
│   ├── main.py             # App entry point
│   ├── models.py           # Database models
│   ├── schemas.py          # Request/response schemas
│   ├── database.py         # DB connection
│   ├── auth.py             # JWT verification
│   ├── routes/             # API endpoints
│   ├── CLAUDE.md           # Backend dev guidelines
│   └── pyproject.toml
├── docker-compose.yml      # Local development setup
├── CLAUDE.md               # Root project guidelines
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+ and npm
- **Python** 3.13+
- **UV** (Python package manager)
- **Docker** and Docker Compose (optional, for local DB)
- **Neon account** (for production database)

### Option 1: Using Docker Compose (Recommended)

1. **Clone and setup**
```bash
cd todo-app-phase2-fullstack
```

2. **Create environment files**

Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-change-this
DATABASE_URL=postgresql://todouser:todopass@localhost:5432/tododb
```

Create `backend/.env`:
```bash
DATABASE_URL=postgresql://todouser:todopass@localhost:5432/tododb
JWT_SECRET=your-secret-key-min-32-chars-change-this
JWT_ALGORITHM=HS256
```

3. **Start all services**
```bash
docker-compose up
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
uv sync
```

3. **Create .env file**
```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/database?sslmode=require
JWT_SECRET=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
```

4. **Run database migrations**
```bash
uv run alembic upgrade head
```

5. **Start the server**
```bash
uv run uvicorn main:app --reload --port 8000
```

Backend runs on http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env.local file**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
DATABASE_URL=your-neon-database-url
```

4. **Run migrations for Better Auth**
```bash
npx better-auth migrate
```

5. **Start the development server**
```bash
npm run dev
```

Frontend runs on http://localhost:3000

## 🗄️ Database Setup

### Using Neon Serverless PostgreSQL (Production)

1. **Create a Neon account** at [neon.tech](https://neon.tech)

2. **Create a new project**

3. **Copy the connection string**
   - Format: `postgresql://user:password@host.neon.tech/database?sslmode=require`

4. **Update environment variables**
   - Add to `backend/.env` as `DATABASE_URL`
   - Add to `frontend/.env.local` as `DATABASE_URL` (for Better Auth)

5. **Run migrations**
```bash
cd backend
uv run alembic upgrade head

cd ../frontend
npx better-auth migrate
```

### Using Local PostgreSQL (Development)

1. **Start PostgreSQL with Docker Compose**
```bash
docker-compose up postgres -d
```

2. **Use local connection string**
```
DATABASE_URL=postgresql://todouser:todopass@localhost:5432/tododb
```

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| GET | `/api/{user_id}/tasks` | List all tasks | Yes |
| POST | `/api/{user_id}/tasks` | Create task | Yes |
| GET | `/api/{user_id}/tasks/{id}` | Get task details | Yes |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | Yes |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | Yes |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | Yes |

### Interactive API Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Authentication Flow

1. User signs up/signs in via Better Auth (frontend)
2. Better Auth issues JWT token
3. Frontend stores token in httpOnly cookie
4. Frontend includes token in `Authorization: Bearer <token>` header
5. Backend verifies token and extracts user_id
6. Backend filters all data by authenticated user_id

## 🎨 Frontend Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Landing page | No |
| `/auth/signin` | Sign in | No |
| `/auth/signup` | Sign up | No |
| `/dashboard` | Task management | Yes |

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

## 🔧 Development Workflow

This project follows the **Agentic Dev Stack** methodology:

1. **Write Spec** → Create detailed specification in `/specs`
2. **Generate Plan** → Use Claude Code to generate implementation plan
3. **Break into Tasks** → Divide into atomic, trackable tasks
4. **Implement via Claude Code** → No manual coding allowed
5. **Review** → Evaluate process, prompts, and iterations

### Working with Specs

All specifications are in the `/specs` directory organized by type:

```bash
# Reference a spec when asking Claude Code to implement
@specs/features/task-crud.md implement task creation

# Reference API spec
@specs/api/rest-endpoints.md implement GET /api/tasks

# Reference database spec
@specs/database/schema.md create the tasks table
```

### CLAUDE.md Files

Context files guide Claude Code:
- **Root CLAUDE.md** - Project overview and navigation
- **frontend/CLAUDE.md** - Frontend patterns and conventions
- **backend/CLAUDE.md** - Backend patterns and conventions

## 📦 Deployment

### Backend Deployment (Railway, Render, Fly.io)

1. **Set environment variables**
```bash
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-production-secret
JWT_ALGORITHM=HS256
```

2. **Deploy command**
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend Deployment (Vercel, Netlify)

1. **Set environment variables**
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
BETTER_AUTH_URL=https://your-frontend-domain.com
BETTER_AUTH_SECRET=your-production-secret
DATABASE_URL=your-neon-connection-string
```

2. **Build command**
```bash
npm run build
```

3. **Start command**
```bash
npm start
```

## 🔐 Security Checklist

- [ ] Use HTTPS in production
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable CORS only for trusted origins
- [ ] Use httpOnly cookies for tokens
- [ ] Verify JWT on all protected endpoints
- [ ] Filter all database queries by user_id
- [ ] Validate all user input
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting (future)
- [ ] Enable email verification (future)

## 🐛 Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is set correctly
- Ensure PostgreSQL is running
- Check port 8000 is not in use

### Frontend won't start
- Check `NEXT_PUBLIC_API_URL` is set
- Ensure backend is running
- Check port 3000 is not in use

### Authentication not working
- Verify `JWT_SECRET` matches in frontend and backend
- Check `BETTER_AUTH_SECRET` is set
- Ensure Better Auth migrations have run

### Can't connect to database
- Verify connection string format
- Check database is accessible
- For Neon: ensure `?sslmode=require` is appended

## 📖 Documentation

- [Spec-Kit Plus Documentation](../specs/overview.md)
- [API Specification](../specs/api/rest-endpoints.md)
- [Database Schema](../specs/database/schema.md)
- [Frontend Guidelines](./frontend/CLAUDE.md)
- [Backend Guidelines](./backend/CLAUDE.md)

## 🤝 Contributing

This project is built using spec-driven development with Claude Code. To contribute:

1. Write a specification in `/specs`
2. Use Claude Code to implement from the spec
3. Test thoroughly
4. Document the process

## 📄 License

MIT License - See LICENSE file for details

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)
- [Better Auth Documentation](https://www.better-auth.com)
- [Neon Documentation](https://neon.tech/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🚧 Roadmap

### Phase III (Planned)
- AI Chatbot integration
- Natural language task creation
- MCP (Model Context Protocol) server
- Task suggestions and insights

## ✅ Success Criteria

- [x] Complete specification documentation
- [ ] User authentication working end-to-end
- [ ] All CRUD operations functional
- [ ] Multi-user data isolation verified
- [ ] Responsive UI on all devices
- [ ] Database persistence working
- [ ] API documentation complete
- [ ] Deployed to production

## 📞 Support

For issues or questions:
- Review the specifications in `/specs`
- Check `CLAUDE.md` files for guidelines
- Consult API documentation at `/docs`

---

**Built with ❤️ using Claude Code and Spec-Driven Development**

Phase: II - Full-Stack Web Application
Version: 2.0
Last Updated: 2026-01-01
