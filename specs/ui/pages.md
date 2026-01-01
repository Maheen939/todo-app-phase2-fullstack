# UI Specification: Pages

**Version**: 2.0
**Date**: 2026-01-01
**Status**: Approved
**Phase**: II - Full-Stack Web Application

## Overview
Page-level specifications for the Todo application frontend. Built with Next.js 16+ App Router, TypeScript, and Tailwind CSS.

## Design Principles
- Mobile-first responsive design
- Clean, minimal interface
- Fast page loads with server components
- Accessibility (WCAG 2.1 AA compliant)
- Dark mode support (future)

## Pages

### 1. Landing Page (`/`)

#### Purpose
Welcome page for anonymous users with authentication options.

#### Layout
```
┌─────────────────────────────────────┐
│         Navbar (Logo + Auth)        │
├─────────────────────────────────────┤
│                                     │
│          Hero Section               │
│    "Your tasks, organized"          │
│   [Get Started] [Sign In]           │
│                                     │
├─────────────────────────────────────┤
│          Features Section           │
│   • Simple • Secure • Fast          │
│                                     │
├─────────────────────────────────────┤
│            Footer                   │
└─────────────────────────────────────┘
```

#### Components
- Navbar
- Hero section with CTA buttons
- Feature highlights (3 columns)
- Footer

#### Behavior
- If user is authenticated, redirect to `/dashboard`
- "Get Started" button → `/auth/signup`
- "Sign In" button → `/auth/signin`

#### File Location
`app/page.tsx`

---

### 2. Sign In Page (`/auth/signin`)

#### Purpose
User authentication page for existing users.

#### Layout
```
┌─────────────────────────────────────┐
│         Simple Navbar (Logo)        │
├─────────────────────────────────────┤
│                                     │
│        ┌──────────────┐             │
│        │  Sign In     │             │
│        │──────────────│             │
│        │ Email        │             │
│        │ [          ] │             │
│        │ Password     │             │
│        │ [          ] │             │
│        │              │             │
│        │  [Sign In]   │             │
│        │              │             │
│        │ New user?    │             │
│        │ Sign up      │             │
│        └──────────────┘             │
│                                     │
└─────────────────────────────────────┘
```

#### Components
- AuthForm component (signin mode)
- Email input
- Password input
- Submit button
- Link to signup page
- Error message display

#### Validation
- Email format validation
- Password required
- Show error messages inline

#### Behavior
- On success → Redirect to `/dashboard`
- On error → Show error message below form
- "Sign up" link → `/auth/signup`

#### File Location
`app/auth/signin/page.tsx`

---

### 3. Sign Up Page (`/auth/signup`)

#### Purpose
New user registration page.

#### Layout
```
┌─────────────────────────────────────┐
│         Simple Navbar (Logo)        │
├─────────────────────────────────────┤
│                                     │
│        ┌──────────────┐             │
│        │  Sign Up     │             │
│        │──────────────│             │
│        │ Name         │             │
│        │ [          ] │             │
│        │ Email        │             │
│        │ [          ] │             │
│        │ Password     │             │
│        │ [          ] │             │
│        │              │             │
│        │  [Sign Up]   │             │
│        │              │             │
│        │ Have account?│             │
│        │ Sign in      │             │
│        └──────────────┘             │
│                                     │
└─────────────────────────────────────┘
```

#### Components
- AuthForm component (signup mode)
- Name input
- Email input
- Password input (with strength indicator)
- Submit button
- Link to signin page
- Error message display

#### Validation
- Name required (2-50 characters)
- Email format validation
- Password strength:
  - Min 8 characters
  - Must have uppercase, lowercase, number, special char
- Real-time validation feedback

#### Behavior
- On success → Auto sign-in and redirect to `/dashboard`
- On error → Show error message (e.g., "Email already registered")
- "Sign in" link → `/auth/signin`

#### File Location
`app/auth/signup/page.tsx`

---

### 4. Dashboard Page (`/dashboard`)

#### Purpose
Main application interface for managing tasks.

#### Layout
```
┌───────────────────────────────────────────────┐
│  Navbar    [user@email.com] [Sign Out]       │
├───────────────────────────────────────────────┤
│                                               │
│  My Tasks                  [+ Add Task]       │
│                                               │
│  [All] [Pending] [Completed]  Sort: ▼        │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ ☐ Buy groceries              [✏️] [🗑️]  │ │
│  │   Get milk, eggs, and bread              │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ ☑ Write documentation        [✏️] [🗑️]  │ │
│  │   Complete API docs                      │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ ☐ Deploy to production       [✏️] [🗑️]  │ │
│  │                                          │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Showing 3 of 3 tasks                         │
│                                               │
└───────────────────────────────────────────────┘
```

#### Components
- DashboardNavbar (with user menu)
- TaskList component
- Filter tabs (All/Pending/Completed)
- Sort dropdown
- Add Task button (opens modal)
- Empty state (when no tasks)
- Task statistics footer

#### States

##### Empty State
```
┌─────────────────────────────────┐
│                                 │
│         📝                      │
│   No tasks yet                  │
│   Create your first task        │
│                                 │
│      [+ Add Task]               │
│                                 │
└─────────────────────────────────┘
```

##### Loading State
```
┌─────────────────────────────────┐
│  ◯ Loading...                   │
│  ◯ Loading...                   │
│  ◯ Loading...                   │
└─────────────────────────────────┘
```

#### Interactions
- Click checkbox → Toggle completion
- Click edit icon → Open edit modal
- Click delete icon → Show confirmation dialog
- Click "+ Add Task" → Open add task modal
- Filter tabs → Update task list
- Sort dropdown → Re-order tasks

#### Protected Route
- Requires authentication
- Redirect to `/auth/signin` if not authenticated

#### File Location
`app/dashboard/page.tsx`

---

### 5. Task Detail Page (`/dashboard/tasks/[id]`) - Optional

#### Purpose
Detailed view of a single task (optional enhancement).

#### Layout
```
┌───────────────────────────────────────────┐
│  ← Back to Dashboard                      │
├───────────────────────────────────────────┤
│                                           │
│  Buy groceries                [✏️] [🗑️]  │
│                                           │
│  Status: Pending                          │
│  Created: Jan 1, 2026 10:00 AM            │
│  Updated: Jan 1, 2026 10:00 AM            │
│                                           │
│  Description:                             │
│  Get milk, eggs, and bread                │
│                                           │
│  [Mark Complete]                          │
│                                           │
└───────────────────────────────────────────┘
```

#### Components
- Back button/link
- Task title
- Task metadata (status, timestamps)
- Task description
- Action buttons (edit, delete, toggle)

#### File Location
`app/dashboard/tasks/[id]/page.tsx`

---

## Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Stacked navigation
- Full-width task cards
- Simplified navbar (hamburger menu)

### Tablet (768px - 1024px)
- Two column layout for some sections
- Condensed navbar
- Medium-width task cards

### Desktop (> 1024px)
- Max width container (1200px)
- Full navbar with all options visible
- Optimal task card width

## Color Scheme

### Light Mode (Default)
```css
--background: #ffffff
--foreground: #000000
--card: #f3f4f6
--card-foreground: #1f2937
--primary: #3b82f6
--primary-foreground: #ffffff
--secondary: #6b7280
--muted: #9ca3af
--accent: #10b981
--destructive: #ef4444
--border: #e5e7eb
```

### Dark Mode (Future)
```css
--background: #0f172a
--foreground: #f1f5f9
--card: #1e293b
--card-foreground: #f1f5f9
--primary: #3b82f6
--primary-foreground: #ffffff
--secondary: #475569
--muted: #64748b
--accent: #10b981
--destructive: #ef4444
--border: #334155
```

## Typography

### Font Family
- Sans: `'Inter', system-ui, sans-serif`
- Mono: `'Fira Code', monospace` (for code)

### Font Sizes
- Heading 1: `2.25rem` (36px)
- Heading 2: `1.875rem` (30px)
- Heading 3: `1.5rem` (24px)
- Body: `1rem` (16px)
- Small: `0.875rem` (14px)
- Tiny: `0.75rem` (12px)

## Spacing Scale
Based on Tailwind CSS spacing scale (4px base unit):
- xs: `0.5rem` (8px)
- sm: `0.75rem` (12px)
- md: `1rem` (16px)
- lg: `1.5rem` (24px)
- xl: `2rem` (32px)
- 2xl: `3rem` (48px)

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Color contrast ratio ≥ 4.5:1 for text
- Focus indicators on all interactive elements
- Keyboard navigation support
- ARIA labels for icon buttons
- Skip to main content link

### Semantic HTML
- Proper heading hierarchy
- Form labels associated with inputs
- Button vs link usage (buttons for actions, links for navigation)
- List elements for task lists

### Screen Reader Support
- Alt text for images
- ARIA live regions for dynamic content
- ARIA labels for icon-only buttons
- Form error announcements

## Loading States

### Page Load
```typescript
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <TaskList />
    </Suspense>
  )
}
```

### Component Loading
- Skeleton screens for data loading
- Spinner for button actions
- Optimistic UI updates

## Error States

### Network Error
```
┌─────────────────────────────────┐
│  ⚠️ Unable to load tasks        │
│  Please check your connection   │
│                                 │
│  [Try Again]                    │
└─────────────────────────────────┘
```

### 404 Not Found
```
┌─────────────────────────────────┐
│  404 - Page Not Found           │
│  The page you're looking for    │
│  doesn't exist.                 │
│                                 │
│  [← Go Home]                    │
└─────────────────────────────────┘
```

### Unauthorized
Redirect to `/auth/signin` with return URL

## Navigation Flow

```
    / (Landing)
     │
     ├─→ /auth/signin ──→ /dashboard
     │                      │
     └─→ /auth/signup ──→  │
                            │
                            ├─→ /dashboard/tasks/[id]
                            │
                            └─→ / (Sign Out)
```

## Performance Targets

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Optimization Strategies
- Server Components by default
- Dynamic imports for modals
- Image optimization with next/image
- Font optimization with next/font
- API route caching where appropriate

## Testing Checklist

### Functional Tests
- [ ] Landing page renders correctly
- [ ] Sign in with valid credentials works
- [ ] Sign up creates new account
- [ ] Dashboard shows user's tasks only
- [ ] Task creation works
- [ ] Task editing works
- [ ] Task deletion works
- [ ] Task completion toggle works
- [ ] Filtering works (All/Pending/Completed)
- [ ] Sorting works
- [ ] Sign out clears session

### Responsive Tests
- [ ] Mobile layout (< 768px)
- [ ] Tablet layout (768px - 1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Touch interactions on mobile

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Color contrast meets AA standards
- [ ] Focus indicators visible

### Browser Tests
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)

## Future Enhancements
- Dark mode toggle
- Task search
- Keyboard shortcuts
- Drag-and-drop task reordering
- Task categories/tags with colors
- Task due date picker
- Calendar view
- Bulk actions
- Export/import tasks
