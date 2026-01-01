# Frontend Development Guidelines

## Stack
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth
- **HTTP Client**: Fetch API

## Project Structure
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page (/)
│   ├── dashboard/          # Dashboard pages
│   │   ├── page.tsx        # /dashboard
│   │   └── tasks/[id]/     # /dashboard/tasks/[id]
│   ├── auth/               # Auth pages
│   │   ├── signin/         # /auth/signin
│   │   └── signup/         # /auth/signup
│   └── api/                # API routes
│       └── auth/[...all]/  # Better Auth handler
├── components/             # React components
│   ├── auth/               # Auth-related components
│   ├── tasks/              # Task-related components
│   ├── ui/                 # Reusable UI primitives
│   ├── Navbar.tsx
│   ├── Logo.tsx
│   └── Footer.tsx
├── lib/                    # Utilities and config
│   ├── auth.ts             # Better Auth server config
│   ├── auth-client.ts      # Better Auth client
│   └── api.ts              # API client for backend
├── types/                  # TypeScript types
│   └── index.ts
├── public/                 # Static assets
├── .env.local              # Environment variables
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Development Patterns

### Server Components by Default
Use server components for static content:

```typescript
// app/page.tsx - Server Component
export default function LandingPage() {
  return (
    <div>
      <h1>Welcome to Todo App</h1>
      {/* Static content */}
    </div>
  )
}
```

### Client Components for Interactivity
Only use `'use client'` when needed:

```typescript
// components/tasks/TaskItem.tsx - Client Component
'use client'

import { useState } from 'react'

export function TaskItem() {
  const [completed, setCompleted] = useState(false)
  // Interactive logic
}
```

### API Client Pattern
All backend calls use the centralized API client:

```typescript
// lib/api.ts
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
  async getTasks(userId: string, params?: { status?: string; sort?: string }) {
    const headers = await getAuthHeaders()
    const query = new URLSearchParams(params as any).toString()
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks?${query}`, {
      headers,
    })
    if (!response.ok) throw new Error('Failed to fetch tasks')
    return response.json()
  },

  async createTask(userId: string, data: { title: string; description?: string }) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create task')
    return response.json()
  },

  async updateTask(userId: string, taskId: number, data: { title: string; description?: string }) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  },

  async toggleTaskComplete(userId: string, taskId: number) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers,
    })
    if (!response.ok) throw new Error('Failed to toggle task')
    return response.json()
  },

  async deleteTask(userId: string, taskId: number) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers,
    })
    if (!response.ok) throw new Error('Failed to delete task')
  },
}
```

### Authentication Pattern

#### Server-side Auth Check
```typescript
// app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth.api.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return <TaskList userId={session.user.id} />
}
```

#### Client-side Auth Hook
```typescript
// components/tasks/TaskList.tsx
'use client'

import { useSession } from '@/lib/auth-client'

export function TaskList() {
  const { data: session } = useSession()

  if (!session) return null

  // Use session.user.id
}
```

## Component Guidelines

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

// 2. TypeScript interface
interface ComponentProps {
  title: string
  onSubmit: () => void
}

// 3. Component
export function MyComponent({ title, onSubmit }: ComponentProps) {
  // 4. State and hooks
  const [loading, setLoading] = useState(false)

  // 5. Event handlers
  const handleClick = () => {
    setLoading(true)
    onSubmit()
  }

  // 6. Render
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={handleClick} loading={loading}>
        Submit
      </Button>
    </div>
  )
}
```

### Styling with Tailwind CSS
```typescript
// Use Tailwind utility classes
<div className="bg-white border rounded-lg p-4 hover:shadow-md">
  <h2 className="text-xl font-bold mb-2">Title</h2>
  <p className="text-gray-600">Description</p>
</div>

// Never use inline styles
// ❌ <div style={{ padding: '16px' }}>
// ✅ <div className="p-4">
```

### Form Handling
```typescript
'use client'

export function TaskForm() {
  const [title, setTitle] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## TypeScript Patterns

### Define Types
```typescript
// types/index.ts
export interface Task {
  id: number
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string | null
}
```

### Use Types in Components
```typescript
import { Task } from '@/types'

interface TaskItemProps {
  task: Task
  onUpdate: () => void
}
```

## Error Handling

### API Errors
```typescript
try {
  await api.createTask(userId, data)
  onSuccess()
} catch (error: any) {
  setError(error.message || 'An error occurred')
}
```

### Display Errors
```typescript
{error && (
  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
    {error}
  </div>
)}
```

## Environment Variables

### .env.local
```bash
# Better Auth
DATABASE_URL=postgresql://user:pass@host/dbname
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Usage in Code
```typescript
// Server-side (app/, lib/)
const dbUrl = process.env.DATABASE_URL

// Client-side (components/)
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

## Routing

### Navigation
```typescript
import { useRouter } from 'next/navigation'

export function MyComponent() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard')
  }
}
```

### Link Component
```typescript
import Link from 'next/link'

<Link href="/dashboard" className="text-blue-600 hover:underline">
  Go to Dashboard
</Link>
```

## Data Fetching

### Client-side with useEffect
```typescript
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export function TaskList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const data = await api.getTasks(userId)
      setTasks(data.tasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  return <div>{/* Render tasks */}</div>
}
```

## Accessibility

### Semantic HTML
```typescript
// ✅ Good
<button onClick={handleClick}>Click me</button>

// ❌ Bad
<div onClick={handleClick}>Click me</div>
```

### ARIA Labels
```typescript
<button
  onClick={handleDelete}
  aria-label={`Delete task: ${task.title}`}
>
  🗑️
</button>
```

### Form Labels
```typescript
<label htmlFor="title">Title</label>
<input id="title" type="text" />
```

## Performance

### Code Splitting
```typescript
// Dynamic import for modals
import dynamic from 'next/dynamic'

const EditTaskModal = dynamic(() => import('./EditTaskModal'), {
  loading: () => <div>Loading...</div>
})
```

### Memoization
```typescript
import { memo } from 'react'

export const TaskItem = memo(function TaskItem({ task }: TaskItemProps) {
  // Component code
})
```

## Testing

### Component Tests
```typescript
// __tests__/TaskItem.test.tsx
import { render, screen } from '@testing-library/react'
import { TaskItem } from '@/components/tasks/TaskItem'

test('renders task title', () => {
  const task = { id: 1, title: 'Test task', /* ... */ }
  render(<TaskItem task={task} onUpdate={() => {}} />)
  expect(screen.getByText('Test task')).toBeInTheDocument()
})
```

## Commands

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
# or
npx tsc --noEmit
```

## File Naming Conventions
- Components: PascalCase (`TaskItem.tsx`)
- Utilities: camelCase (`auth-client.ts`)
- Pages: lowercase (`page.tsx`, `layout.tsx`)
- Types: PascalCase (`Task`, `User`)

## Import Aliases
Use `@/` prefix for cleaner imports:

```typescript
// ✅ Good
import { api } from '@/lib/api'
import { TaskItem } from '@/components/tasks/TaskItem'

// ❌ Bad
import { api } from '../../lib/api'
import { TaskItem } from '../components/tasks/TaskItem'
```

## Spec References
When implementing features, reference these specs:
- Features: `@specs/features/task-crud.md`, `@specs/features/authentication.md`
- UI: `@specs/ui/pages.md`, `@specs/ui/components.md`
- API: `@specs/api/rest-endpoints.md`

## Common Patterns Summary

| Task | Pattern |
|------|---------|
| API Call | Use `api` object from `@/lib/api` |
| Auth Check | Use `auth.api.getSession()` |
| Navigation | Use `useRouter()` from `next/navigation` |
| Styling | Use Tailwind CSS classes |
| Forms | Use controlled components with `useState` |
| Errors | Show in UI with conditional rendering |
| Loading | Use loading state + spinner/skeleton |

## Best Practices
1. Keep components small and focused
2. Extract reusable UI into `/components/ui`
3. Use TypeScript for all props and state
4. Handle loading and error states
5. Use semantic HTML and ARIA labels
6. Follow accessibility guidelines
7. Optimize for performance (memo, dynamic imports)
8. Write tests for critical paths
