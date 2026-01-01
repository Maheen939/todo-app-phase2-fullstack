# Database Schema Specification

**Version**: 2.0
**Date**: 2026-01-01
**Status**: Approved
**Phase**: II - Full-Stack Web Application
**Database**: Neon Serverless PostgreSQL

## Overview
Complete database schema for the Todo application with user authentication and task management. Uses PostgreSQL as the database engine with SQLModel ORM.

## Database Provider

### Neon Serverless PostgreSQL
- **Type**: Serverless PostgreSQL
- **Features**: Auto-scaling, branching, point-in-time restore
- **Connection**: Via connection string (DATABASE_URL)
- **Pooling**: Built-in connection pooling

### Connection String Format
```
postgresql://username:password@host/database?sslmode=require
```

## Tables

### 1. users
User accounts managed by Better Auth.

#### Schema
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    name VARCHAR(255),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | VARCHAR(255) | No | - | Unique user identifier (UUID) |
| email | VARCHAR(255) | No | - | User email address (unique) |
| email_verified | BOOLEAN | No | FALSE | Email verification status |
| name | VARCHAR(255) | Yes | NULL | User display name |
| image | TEXT | Yes | NULL | Profile image URL |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Last update time |

#### Indexes
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Constraints
- `id` is PRIMARY KEY
- `email` must be UNIQUE
- `email` must be valid email format (application-level validation)

---

### 2. accounts
OAuth provider accounts linked to users (managed by Better Auth).

#### Schema
```sql
CREATE TABLE accounts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Indexes
```sql
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE UNIQUE INDEX idx_accounts_provider ON accounts(provider_id, account_id);
```

---

### 3. sessions
Active user sessions (managed by Better Auth).

#### Schema
```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Indexes
```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

### 4. verification_tokens
Email verification and password reset tokens (managed by Better Auth).

#### Schema
```sql
CREATE TABLE verification_tokens (
    id VARCHAR(255) PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Indexes
```sql
CREATE UNIQUE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_identifier ON verification_tokens(identifier);
```

---

### 5. tasks
Todo tasks created by users.

#### Schema
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | No | auto-increment | Task unique identifier |
| user_id | VARCHAR(255) | No | - | Owner of the task (foreign key) |
| title | VARCHAR(200) | No | - | Task title |
| description | TEXT | Yes | NULL | Task description (optional) |
| completed | BOOLEAN | No | FALSE | Completion status |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Task creation time |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Last modification time |

#### Indexes
```sql
-- Primary index on id (automatic)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
```

#### Constraints
- `id` is PRIMARY KEY (auto-incrementing)
- `user_id` is FOREIGN KEY to `users(id)` with CASCADE DELETE
- `title` is NOT NULL
- `completed` defaults to FALSE

#### Triggers
```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## SQLModel Models

### User Model (Read-only for backend)
```python
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    email_verified: bool = Field(default=False)
    name: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Task Model
```python
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = None
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Task Create Schema
```python
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
```

### Task Update Schema
```python
class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
```

### Task Response Schema
```python
class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

## Relationships

### Entity Relationship Diagram
```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │◄─────┐
│ email        │      │
│ name         │      │
│ created_at   │      │
└──────────────┘      │
                      │ (1:N)
                      │
                ┌─────┴────────┐
                │    tasks     │
                │──────────────│
                │ id (PK)      │
                │ user_id (FK) │
                │ title        │
                │ description  │
                │ completed    │
                │ created_at   │
                │ updated_at   │
                └──────────────┘
```

### Relationship Rules
1. **users → tasks**: One-to-Many
   - One user can have many tasks
   - Tasks must belong to exactly one user
   - Deleting a user cascades to delete their tasks

2. **users → sessions**: One-to-Many
   - One user can have multiple active sessions
   - Deleting a user cascades to delete their sessions

3. **users → accounts**: One-to-Many
   - One user can link multiple OAuth providers
   - Deleting a user cascades to delete their linked accounts

## Data Isolation

### User Data Separation
- All task queries MUST filter by `user_id`
- Backend enforces user_id from JWT token
- Users cannot access other users' tasks
- Database-level foreign key constraints ensure referential integrity

### Example Secure Query
```python
# CORRECT - Filtered by authenticated user
def get_user_tasks(user_id: str, db: Session) -> List[Task]:
    return db.query(Task).filter(Task.user_id == user_id).all()

# INCORRECT - Returns all tasks (security violation)
def get_all_tasks(db: Session) -> List[Task]:
    return db.query(Task).all()  # ❌ Never do this!
```

## Database Initialization

### Alembic Migration Script
```python
# alembic/versions/001_initial_schema.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Create users table (Better Auth)
    op.create_table(
        'users',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('email_verified', sa.Boolean(), default=False),
        sa.Column('name', sa.String(255)),
        sa.Column('image', sa.Text()),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_users_email', 'users', ['email'])

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('completed', sa.Boolean(), default=False, nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_completed', 'tasks', ['completed'])
    op.create_index('idx_tasks_user_completed', 'tasks', ['user_id', 'completed'])

    # Add other Better Auth tables...

def downgrade():
    op.drop_table('tasks')
    op.drop_table('users')
```

## Query Performance

### Optimization Strategies

#### 1. Use Indexes Effectively
```python
# Good - Uses idx_tasks_user_id
tasks = db.query(Task).filter(Task.user_id == user_id).all()

# Good - Uses idx_tasks_user_completed composite index
pending = db.query(Task).filter(
    Task.user_id == user_id,
    Task.completed == False
).all()
```

#### 2. Pagination
```python
# Limit results to prevent large queries
tasks = db.query(Task)\
    .filter(Task.user_id == user_id)\
    .order_by(Task.created_at.desc())\
    .limit(100)\
    .offset(0)\
    .all()
```

#### 3. Count Queries
```python
# Use COUNT for statistics
total = db.query(Task).filter(Task.user_id == user_id).count()
pending = db.query(Task).filter(
    Task.user_id == user_id,
    Task.completed == False
).count()
```

## Backup and Restore

### Neon Branching
Neon supports database branching for:
- Development branches
- Testing
- Point-in-time restore

### Manual Backup (pg_dump)
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

## Environment Configuration

### Database URL
```bash
# .env file
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
```

### Connection Pooling
```python
from sqlmodel import create_engine, Session

# Create engine with connection pool
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before use
    echo=False  # Set to True for SQL logging
)
```

## Testing Data

### Sample User
```sql
INSERT INTO users (id, email, name, email_verified)
VALUES ('test-user-123', 'test@example.com', 'Test User', true);
```

### Sample Tasks
```sql
INSERT INTO tasks (user_id, title, description, completed)
VALUES
    ('test-user-123', 'Buy groceries', 'Milk, eggs, bread', false),
    ('test-user-123', 'Write documentation', 'Complete API docs', true),
    ('test-user-123', 'Deploy to production', null, false);
```

## Migration Commands

### Initialize Alembic
```bash
cd backend
alembic init alembic
```

### Create Migration
```bash
alembic revision --autogenerate -m "Initial schema"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

## Database Constraints Summary

| Table | Primary Key | Foreign Keys | Unique Constraints | Defaults |
|-------|-------------|--------------|-------------------|----------|
| users | id | - | email | email_verified=false |
| accounts | id | user_id → users.id | (provider_id, account_id) | - |
| sessions | id | user_id → users.id | - | - |
| verification_tokens | id | - | token | - |
| tasks | id | user_id → users.id | - | completed=false |

## Security Considerations

### SQL Injection Prevention
- SQLModel/SQLAlchemy uses parameterized queries
- Never concatenate user input into SQL strings
- All ORM queries are safe by default

### Access Control
- Row-level security via application logic (filter by user_id)
- Foreign key constraints ensure referential integrity
- CASCADE DELETE removes user data on account deletion

### Sensitive Data
- Passwords hashed via Better Auth (bcrypt)
- JWT secrets stored in environment variables
- Connection strings use SSL (sslmode=require)

## Future Enhancements
- Task tags/categories (new table)
- Task priorities (add column)
- Task due dates (add column)
- Task attachments (new table + file storage)
- Soft delete (add deleted_at column)
- Task sharing (new junction table)
- Full-text search (add GIN index)
