# Todo App Frontend

Next.js 16+ frontend with Better Auth and Tailwind CSS.

## Features

- ✅ Next.js 16+ with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Better Auth for authentication
- ✅ JWT token integration with FastAPI backend
- ✅ Responsive UI components
- ✅ Protected routes with middleware

## Quick Start

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open http://localhost:3000

## Pages

- `/` - Landing page
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up
- `/dashboard` - Task management (protected)

## Components

### UI Components (`components/ui/`)
- Button - Button with variants and loading state
- Input - Text input with label and error
- Textarea - Multiline input
- Modal - Modal dialog with backdrop
- Checkbox - Checkbox input

### Task Components (`components/tasks/`)
- TaskList - List of tasks with filtering/sorting
- TaskItem - Individual task card
- AddTaskModal - Create new task
- EditTaskModal - Update existing task
- DeleteConfirmDialog - Confirm deletion
- TaskFilter - Filter and sort controls
- EmptyState - No tasks message
- LoadingState - Loading skeleton

### Layout Components
- Navbar - Navigation with auth state
- Logo - App logo
- Footer - Page footer

## See Full Documentation

Refer to `../README.md` for complete project documentation and `CLAUDE.md` for development guidelines.
