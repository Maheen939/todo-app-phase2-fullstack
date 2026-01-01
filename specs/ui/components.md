# UI Specification: Components

**Version**: 2.0
**Date**: 2026-01-01
**Status**: Approved
**Phase**: II - Full-Stack Web Application

## Overview
Reusable component specifications for the Todo application frontend. Components are built with React, TypeScript, and Tailwind CSS.

## Component Architecture

### Principles
- Small, focused components
- Server Components by default
- Client Components only when needed (interactivity, hooks)
- Prop-driven, not context-heavy
- TypeScript for all props
- Tailwind for styling

### Component Types
- **Server Components**: Static, no interactivity (default)
- **Client Components**: Interactive, use hooks (`'use client'`)
- **Layout Components**: Page structure
- **Feature Components**: Domain-specific logic
- **UI Components**: Generic, reusable

---

## Layout Components

### 1. Navbar

#### Purpose
Top navigation bar with logo and authentication controls.

#### Props
```typescript
interface NavbarProps {
  user?: {
    email: string
    name?: string
  } | null
}
```

#### Variants

##### Anonymous User
```tsx
<nav className="border-b">
  <div className="container flex justify-between items-center py-4">
    <Logo />
    <div className="flex gap-4">
      <Button variant="ghost">Sign In</Button>
      <Button>Sign Up</Button>
    </div>
  </div>
</nav>
```

##### Authenticated User
```tsx
<nav className="border-b">
  <div className="container flex justify-between items-center py-4">
    <Logo />
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted">{user.email}</span>
      <Button variant="outline" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  </div>
</nav>
```

#### Implementation
```typescript
// components/Navbar.tsx
'use client'

import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await auth.signOut()
    router.push('/')
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Logo />
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
            <Button onClick={() => router.push('/auth/signup')}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
```

#### File Location
`components/Navbar.tsx`

---

### 2. Logo

#### Purpose
Application logo and branding.

#### Implementation
```typescript
// components/Logo.tsx
import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">T</span>
      </div>
      <span className="font-semibold text-xl">Todo App</span>
    </Link>
  )
}
```

---

### 3. Footer

#### Purpose
Page footer with links and copyright.

#### Implementation
```typescript
// components/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto text-center text-sm text-gray-600">
        <p>&copy; 2026 Todo App. Built with Claude Code.</p>
      </div>
    </footer>
  )
}
```

---

## Authentication Components

### 4. AuthForm

#### Purpose
Reusable form for both signin and signup.

#### Props
```typescript
interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSuccess?: () => void
}
```

#### Implementation
```typescript
// components/auth/AuthForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        await auth.signUp.email({ email, password, name })
      } else {
        await auth.signIn.email({ email, password })
      }

      onSuccess?.()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center">
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {mode === 'signup' && (
        <Input
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
        />
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="••••••••"
        minLength={8}
      />

      <Button type="submit" fullWidth loading={loading}>
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        {mode === 'signin' ? (
          <>
            New user?{' '}
            <a href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </>
        ) : (
          <>
            Have an account?{' '}
            <a href="/auth/signin" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </>
        )}
      </p>
    </form>
  )
}
```

#### File Location
`components/auth/AuthForm.tsx`

---

## Task Components

### 5. TaskList

#### Purpose
Display list of tasks with filtering and sorting.

#### Props
```typescript
interface TaskListProps {
  userId: string
}
```

#### Implementation
```typescript
// components/tasks/TaskList.tsx
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { TaskItem } from './TaskItem'
import { AddTaskButton } from './AddTaskButton'
import { TaskFilter } from './TaskFilter'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'

export function TaskList({ userId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [sort, setSort] = useState<'created' | 'title' | 'updated'>('created')

  useEffect(() => {
    loadTasks()
  }, [filter, sort])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const data = await api.getTasks(userId, { status: filter, sort })
      setTasks(data.tasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = () => {
    loadTasks()
  }

  if (loading) {
    return <LoadingState />
  }

  if (tasks.length === 0) {
    return <EmptyState onAddTask={loadTasks} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <AddTaskButton userId={userId} onSuccess={loadTasks} />
      </div>

      <TaskFilter
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            userId={userId}
            onUpdate={handleTaskUpdate}
          />
        ))}
      </div>

      <div className="text-sm text-gray-600 text-center">
        Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
```

#### File Location
`components/tasks/TaskList.tsx`

---

### 6. TaskItem

#### Purpose
Individual task card with actions.

#### Props
```typescript
interface TaskItemProps {
  task: Task
  userId: string
  onUpdate: () => void
}
```

#### Implementation
```typescript
// components/tasks/TaskItem.tsx
'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { EditTaskModal } from './EditTaskModal'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export function TaskItem({ task, userId, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = async () => {
    try {
      await api.toggleTaskComplete(userId, task.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await api.deleteTask(userId, task.id)
      onUpdate()
      setIsDeleting(false)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  return (
    <>
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onChange={handleToggleComplete}
            aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />

          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium ${
                task.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              aria-label="Edit task"
            >
              ✏️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleting(true)}
              aria-label="Delete task"
            >
              🗑️
            </Button>
          </div>
        </div>
      </div>

      {isEditing && (
        <EditTaskModal
          task={task}
          userId={userId}
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false)
            onUpdate()
          }}
        />
      )}

      {isDeleting && (
        <DeleteConfirmDialog
          taskTitle={task.title}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleting(false)}
        />
      )}
    </>
  )
}
```

#### File Location
`components/tasks/TaskItem.tsx`

---

### 7. AddTaskButton / AddTaskModal

#### Purpose
Button and modal for creating new tasks.

#### Implementation
```typescript
// components/tasks/AddTaskButton.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AddTaskModal } from './AddTaskModal'

export function AddTaskButton({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ Add Task</Button>

      {isOpen && (
        <AddTaskModal
          userId={userId}
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false)
            onSuccess()
          }}
        />
      )}
    </>
  )
}
```

```typescript
// components/tasks/AddTaskModal.tsx
'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

export function AddTaskModal({ userId, onClose, onSuccess }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.createTask(userId, { title, description })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add New Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="What needs to be done?"
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Add more details..."
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

---

### 8. EditTaskModal

#### Purpose
Modal for editing existing task.

#### Props
```typescript
interface EditTaskModalProps {
  task: Task
  userId: string
  onClose: () => void
  onSuccess: () => void
}
```

#### Implementation
Similar to AddTaskModal but pre-fills with task data and calls `api.updateTask()`.

---

### 9. DeleteConfirmDialog

#### Purpose
Confirmation dialog before deleting task.

#### Implementation
```typescript
// components/tasks/DeleteConfirmDialog.tsx
'use client'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export function DeleteConfirmDialog({ taskTitle, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <Modal title="Delete Task" onClose={onCancel}>
      <div className="space-y-4">
        <p>
          Are you sure you want to delete <strong>{taskTitle}</strong>?
        </p>
        <p className="text-sm text-gray-600">This action cannot be undone.</p>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

---

### 10. TaskFilter

#### Purpose
Filter and sort controls for task list.

#### Implementation
```typescript
// components/tasks/TaskFilter.tsx
'use client'

export function TaskFilter({ filter, onFilterChange, sort, onSortChange }: TaskFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex gap-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => onFilterChange('all')}
        >
          All
        </FilterButton>
        <FilterButton
          active={filter === 'pending'}
          onClick={() => onFilterChange('pending')}
        >
          Pending
        </FilterButton>
        <FilterButton
          active={filter === 'completed'}
          onClick={() => onFilterChange('completed')}
        >
          Completed
        </FilterButton>
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as any)}
        className="border rounded-lg px-3 py-2 text-sm"
      >
        <option value="created">Sort by Date</option>
        <option value="title">Sort by Title</option>
        <option value="updated">Sort by Updated</option>
      </select>
    </div>
  )
}
```

---

## UI Primitive Components

### 11. Button

#### Props
```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
}
```

#### Implementation
```typescript
// components/ui/Button.tsx
export function Button({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2'

  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'hover:bg-gray-100 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  const className = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
  `.trim()

  return (
    <button className={className} disabled={loading} {...props}>
      {loading ? 'Loading...' : children}
    </button>
  )
}
```

---

### 12. Input

#### Props
```typescript
interface InputProps {
  label?: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  maxLength?: number
  minLength?: number
}
```

---

### 13. Textarea

Similar to Input but for multiline text.

---

### 14. Modal

#### Props
```typescript
interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
}
```

#### Implementation
```typescript
// components/ui/Modal.tsx
'use client'

import { useEffect } from 'react'

export function Modal({ title, children, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

---

### 15. Checkbox

#### Implementation
```typescript
// components/ui/Checkbox.tsx
export function Checkbox({ checked, onChange, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      {...props}
    />
  )
}
```

---

## Helper Components

### 16. EmptyState

```typescript
// components/tasks/EmptyState.tsx
export function EmptyState({ onAddTask }: { onAddTask: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
      <p className="text-gray-600 mb-4">Create your first task to get started</p>
      <Button onClick={onAddTask}>+ Add Task</Button>
    </div>
  )
}
```

---

### 17. LoadingState

```typescript
// components/tasks/LoadingState.tsx
export function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
      ))}
    </div>
  )
}
```

---

## Component File Structure

```
components/
├── auth/
│   └── AuthForm.tsx
├── tasks/
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── AddTaskButton.tsx
│   ├── AddTaskModal.tsx
│   ├── EditTaskModal.tsx
│   ├── DeleteConfirmDialog.tsx
│   ├── TaskFilter.tsx
│   ├── EmptyState.tsx
│   └── LoadingState.tsx
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Modal.tsx
│   └── Checkbox.tsx
├── Navbar.tsx
├── Logo.tsx
└── Footer.tsx
```

## Testing Components

### Unit Tests (with Jest + React Testing Library)
```typescript
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

### Component Story (with Storybook)
```typescript
// stories/Button.stories.tsx
export default {
  title: 'UI/Button',
  component: Button,
}

export const Default = () => <Button>Default Button</Button>
export const Outline = () => <Button variant="outline">Outline Button</Button>
```

## Accessibility Guidelines

- Use semantic HTML (`<button>`, `<form>`, etc.)
- Provide `aria-label` for icon-only buttons
- Ensure keyboard navigation works
- Add focus indicators
- Use proper heading hierarchy
- Associate labels with form inputs

## Performance Optimization

- Use React.memo() for expensive components
- Implement virtual scrolling for large lists (future)
- Lazy load modals with dynamic imports
- Optimize re-renders with proper key props
