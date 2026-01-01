# Feature Specification: Task CRUD Operations

**Version**: 2.0
**Date**: 2026-01-01
**Status**: Approved
**Phase**: II - Full-Stack Web Application

## Overview
Implement complete CRUD (Create, Read, Update, Delete) operations for tasks in a multi-user web application with RESTful API.

## User Stories

### US-1: Create Task
**As a** logged-in user
**I want to** create a new task with a title and optional description
**So that** I can track things I need to do

**Acceptance Criteria:**
- Title is required (1-200 characters)
- Description is optional (max 1000 characters)
- Task is automatically associated with logged-in user
- Task starts in incomplete status
- Timestamps (created_at, updated_at) are automatically set
- API returns the created task object
- Frontend shows success message and updates task list

### US-2: View All Tasks
**As a** logged-in user
**I want to** see all my tasks
**So that** I can review what needs to be done

**Acceptance Criteria:**
- Only display tasks belonging to the logged-in user
- Show task title, status (complete/incomplete), and created date
- Display completion indicator (checkbox or icon)
- Support filtering by status (all/pending/completed)
- Support sorting by created date, title, or due date
- Empty state message when no tasks exist
- Responsive design for mobile and desktop

### US-3: View Task Details
**As a** logged-in user
**I want to** view detailed information about a specific task
**So that** I can see the full description and metadata

**Acceptance Criteria:**
- Display full title and description
- Show created and updated timestamps
- Show completion status
- Provide edit and delete actions
- Return 404 if task doesn't exist or belongs to different user

### US-4: Update Task
**As a** logged-in user
**I want to** edit a task's title and description
**So that** I can correct mistakes or add details

**Acceptance Criteria:**
- Can update title and/or description
- Title remains required (1-200 characters)
- Description optional (max 1000 characters)
- updated_at timestamp is automatically set
- Can only update own tasks (security check)
- Frontend shows success message
- Task list updates immediately

### US-5: Delete Task
**As a** logged-in user
**I want to** delete a task
**So that** I can remove tasks I no longer need

**Acceptance Criteria:**
- Show confirmation dialog before deletion
- Can only delete own tasks (security check)
- Task is permanently removed from database
- Frontend shows success message
- Task is removed from list immediately
- Return 404 if task doesn't exist

### US-6: Toggle Task Completion
**As a** logged-in user
**I want to** mark tasks as complete or incomplete
**So that** I can track my progress

**Acceptance Criteria:**
- Can toggle completion status with single action
- Visual indicator changes immediately
- updated_at timestamp is set
- Can only modify own tasks
- Works from task list or detail view

## API Endpoints

### POST /api/{user_id}/tasks
Create a new task

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Optional description"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": "user-uuid",
  "title": "Task title",
  "description": "Optional description",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z"
}
```

### GET /api/{user_id}/tasks
List all tasks for authenticated user

**Query Parameters:**
- `status`: "all" | "pending" | "completed" (default: "all")
- `sort`: "created" | "title" | "updated" (default: "created")
- `order`: "asc" | "desc" (default: "desc")

**Response:** `200 OK`
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": "user-uuid",
      "title": "Task title",
      "description": "Description",
      "completed": false,
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z"
    }
  ],
  "total": 10,
  "pending": 7,
  "completed": 3
}
```

### GET /api/{user_id}/tasks/{id}
Get specific task details

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": "user-uuid",
  "title": "Task title",
  "description": "Description",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z"
}
```

**Error Response:** `404 Not Found`

### PUT /api/{user_id}/tasks/{id}
Update task title and/or description

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response:** `200 OK` (returns updated task object)

### PATCH /api/{user_id}/tasks/{id}/complete
Toggle task completion status

**Response:** `200 OK`
```json
{
  "id": 1,
  "completed": true,
  "updated_at": "2026-01-01T10:05:00Z"
}
```

### DELETE /api/{user_id}/tasks/{id}
Delete a task

**Response:** `204 No Content`

## Validation Rules

### Title
- Required field
- Minimum length: 1 character
- Maximum length: 200 characters
- No HTML tags allowed

### Description
- Optional field
- Maximum length: 1000 characters
- No HTML tags allowed

### User Authorization
- All operations require valid JWT token
- User can only access/modify their own tasks
- Return 401 for missing/invalid token
- Return 403 for unauthorized access to other users' tasks

## Error Handling

### HTTP Status Codes
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Trying to access another user's task
- `404 Not Found` - Task doesn't exist
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "error": "Error message",
  "detail": "Detailed explanation",
  "field": "field_name" // For validation errors
}
```

## Frontend Components

### TaskList Component
- Displays all tasks in a list/grid
- Filter controls (All/Pending/Completed)
- Sort controls
- Add Task button
- Empty state message

### TaskItem Component
- Checkbox for completion toggle
- Task title (truncated if long)
- Edit icon/button
- Delete icon/button
- Click to view details

### AddTaskForm Component
- Title input (required)
- Description textarea (optional)
- Submit button
- Cancel button
- Form validation with error messages

### EditTaskModal Component
- Pre-filled title and description
- Same validation as AddTaskForm
- Save and Cancel buttons
- Closes on successful update

## Database Considerations

### Indexes
- `tasks.user_id` - For filtering by user (performance)
- `tasks.completed` - For status filtering
- `tasks.created_at` - For sorting
- Composite index on `(user_id, completed)` for common queries

### Constraints
- `user_id` is foreign key to users table
- `title` is NOT NULL
- `completed` defaults to FALSE

## Security Requirements

1. **Authentication Required**: All endpoints require valid JWT
2. **User Isolation**: Users can only access their own tasks
3. **Input Validation**: Sanitize all user input
4. **SQL Injection Prevention**: Use parameterized queries (SQLModel handles this)
5. **XSS Prevention**: Escape HTML in frontend display

## Performance Considerations

- Implement pagination for large task lists (future enhancement)
- Use database indexes for efficient queries
- Cache user authentication to avoid repeated validation
- Optimize frontend re-renders with React best practices

## Testing Requirements

### Unit Tests
- Task creation with valid/invalid data
- Authorization checks
- Validation logic

### Integration Tests
- Full CRUD flow
- User isolation (can't access other users' tasks)
- JWT authentication flow

### E2E Tests
- User creates, views, updates, completes, and deletes task
- Filter and sort functionality
- Mobile responsive behavior

## Future Enhancements (Out of Scope for Phase II)
- Task priorities
- Due dates and reminders
- Task categories/tags
- Task sharing between users
- Subtasks
- File attachments
