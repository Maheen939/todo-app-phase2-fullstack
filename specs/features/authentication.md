# Feature Specification: User Authentication

**Version**: 2.0
**Date**: 2026-01-01
**Status**: Approved
**Phase**: II - Full-Stack Web Application

## Overview
Implement user authentication using Better Auth with JWT tokens for securing the FastAPI backend.

## Authentication Architecture

### The Challenge
Better Auth is a JavaScript/TypeScript authentication library that runs on the Next.js frontend. The FastAPI backend is a separate Python service that needs to verify which user is making API requests.

### The Solution: JWT Tokens

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Next.js   │   JWT   │   FastAPI    │  Query  │  PostgreSQL │
│ Better Auth │ ──────> │   Backend    │ ──────> │   Database  │
│  (Frontend) │ <────── │  (Verify JWT)│ <────── │             │
└─────────────┘   User  └──────────────┘  Data   └─────────────┘
                  Data
```

### Flow
1. User signs up/signs in via Better Auth (Next.js frontend)
2. Better Auth issues JWT token
3. Frontend stores JWT (httpOnly cookie or localStorage)
4. Frontend includes JWT in Authorization header for all API requests
5. FastAPI verifies JWT signature and extracts user_id
6. Backend uses user_id to filter/secure all database operations

## User Stories

### US-AUTH-1: User Sign Up
**As a** new user
**I want to** create an account with email and password
**So that** I can access the todo application

**Acceptance Criteria:**
- Email must be unique and valid format
- Password must be at least 8 characters
- Password must contain: uppercase, lowercase, number, special character
- User receives confirmation message
- User is automatically signed in after registration
- User record created in database with id, email, name, created_at

### US-AUTH-2: User Sign In
**As a** registered user
**I want to** sign in with my email and password
**So that** I can access my tasks

**Acceptance Criteria:**
- Email and password are required
- Show error for invalid credentials
- JWT token is issued on successful authentication
- Token is stored securely (httpOnly cookie)
- User is redirected to dashboard
- Token includes user_id claim

### US-AUTH-3: User Sign Out
**As a** logged-in user
**I want to** sign out
**So that** my account is secure

**Acceptance Criteria:**
- Clear authentication token
- Redirect to landing page
- Cannot access protected routes after sign out

### US-AUTH-4: Protected Routes
**As a** the application
**I want to** require authentication for protected routes
**So that** only logged-in users can access their data

**Acceptance Criteria:**
- Dashboard requires authentication
- Unauthenticated users redirected to sign-in
- API endpoints return 401 for missing/invalid token
- Frontend checks auth state before rendering protected components

### US-AUTH-5: Token Verification
**As a** the backend API
**I want to** verify JWT tokens on every request
**So that** I can identify the authenticated user

**Acceptance Criteria:**
- Extract token from Authorization header
- Verify token signature using secret key
- Extract user_id from token claims
- Return 401 for expired or invalid tokens
- Inject user_id into request context for route handlers

## Better Auth Configuration

### Frontend Setup (Next.js)

#### Installation
```bash
npm install better-auth @better-auth/next
```

#### Auth Configuration (`lib/auth.ts`)
```typescript
import { BetterAuth } from 'better-auth'

export const auth = new BetterAuth({
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production
  },
})
```

#### Auth Routes (`app/api/auth/[...all]/route.ts`)
```typescript
import { auth } from '@/lib/auth'

export const { GET, POST } = auth.handler
```

### JWT Token Format

#### Token Claims
```json
{
  "sub": "user-uuid",          // Subject (user_id)
  "email": "user@example.com",  // User email
  "iat": 1704110400,            // Issued at (timestamp)
  "exp": 1704196800,            // Expiration (timestamp)
  "iss": "better-auth"          // Issuer
}
```

## FastAPI Backend Integration

### JWT Verification

#### Dependencies (`backend/auth.py`)
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Optional

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Verify JWT token and extract user_id.

    Returns:
        user_id: The authenticated user's ID

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
```

#### Using in Route Handlers
```python
@app.get("/api/{user_id}/tasks")
async def get_tasks(
    user_id: str,
    authenticated_user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # Verify the user_id in URL matches authenticated user
    if user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")

    # Proceed with query
    tasks = db.query(Task).filter(Task.user_id == authenticated_user_id).all()
    return tasks
```

## Database Schema

### Users Table (Managed by Better Auth)
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Sessions Table (Better Auth)
```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

### Accounts Table (Better Auth - for OAuth providers)
```sql
CREATE TABLE accounts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Frontend Components

### SignInForm Component
```typescript
// app/auth/signin/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth-client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await auth.signIn.email({
        email,
        password,
      })
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Sign In</button>
      {error && <p>{error}</p>}
    </form>
  )
}
```

### SignUpForm Component
Similar to SignInForm but calls `auth.signUp.email()`

### Protected Route Middleware
```typescript
// middleware.ts
import { auth } from '@/lib/auth-client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

## API Client with JWT

### Frontend API Client (`lib/api.ts`)
```typescript
import { auth } from '@/lib/auth-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth.api.getSession()

  if (!session?.session?.token) {
    throw new Error('No authentication token')
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.session.token}`,
  }
}

export const api = {
  async getTasks(userId: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
      headers,
    })
    return response.json()
  },

  async createTask(userId: string, data: { title: string; description?: string }) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // ... other methods
}
```

## Security Requirements

### Password Security
- Minimum 8 characters
- Must contain uppercase, lowercase, number, special character
- Hashed using bcrypt (Better Auth handles this)
- Never store plaintext passwords

### JWT Security
- Use strong secret key (256-bit minimum)
- Store secret in environment variables
- Set reasonable token expiration (24 hours recommended)
- Use HTTPS in production
- httpOnly cookies for token storage (preferred)

### API Security
- Verify JWT on every protected endpoint
- Check user_id matches authenticated user
- Rate limiting on auth endpoints (prevent brute force)
- CORS configured to allow only trusted origins

## Error Handling

### Authentication Errors
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Valid token but insufficient permissions
- `400 Bad Request` - Invalid email/password format
- `409 Conflict` - Email already registered

### Frontend Error Messages
- "Invalid email or password" - Sign in failure
- "Email already registered" - Sign up with existing email
- "Password must be at least 8 characters" - Validation error
- "Session expired. Please sign in again." - Expired token

## Testing Requirements

### Unit Tests
- JWT token generation and verification
- Password validation
- User creation with duplicate email

### Integration Tests
- Complete sign up flow
- Complete sign in flow
- Protected route access with/without token
- Token expiration handling

### Security Tests
- Attempt to access other user's data
- Use expired token
- Use malformed token
- SQL injection attempts

## Environment Variables

### Frontend (.env.local)
```bash
DATABASE_URL=postgresql://user:pass@host/dbname
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=same-as-better-auth-secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

## Deployment Considerations

### Production Checklist
- ✓ Use HTTPS for all requests
- ✓ Enable email verification
- ✓ Set secure secret keys
- ✓ Configure CORS properly
- ✓ Enable rate limiting
- ✓ Use httpOnly cookies
- ✓ Set appropriate token expiration
- ✓ Monitor for suspicious activity

## Future Enhancements (Out of Scope)
- OAuth providers (Google, GitHub)
- Two-factor authentication (2FA)
- Email verification
- Password reset flow
- Remember me functionality
- Session management dashboard
