# API Specification: REST Endpoints

**Version**: 2.0
**Date**: 2026-01-01
**Status**: Approved
**Phase**: II - Full-Stack Web Application

## Overview
Complete API specification for the Todo application backend. All endpoints follow RESTful conventions and require JWT authentication.

## Base Configuration

### Base URL
- **Development**: `http://localhost:8000`
- **Production**: TBD (to be deployed)

### API Versioning
Current version: v1 (implicit)
All endpoints are prefixed with `/api/`

### Content Type
- Request: `application/json`
- Response: `application/json`

## Authentication

### Authorization Header
All endpoints (except health check) require JWT token:

```http
Authorization: Bearer <jwt_token>
```

### Token Format
JWT token obtained from Better Auth signin/signup flow.

**Token Claims:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1704110400,
  "exp": 1704196800
}
```

### Authentication Errors

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "detail": "Missing or invalid authentication token"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "detail": "You don't have permission to access this resource"
}
```

## Endpoints

### Health Check

#### GET /health
Check if API server is running.

**Authentication**: Not required

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-01-01T10:00:00Z",
  "version": "2.0"
}
```

---

### Task Endpoints

#### POST /api/{user_id}/tasks
Create a new task for the authenticated user.

**Authentication**: Required

**Path Parameters:**
- `user_id` (string): Must match the authenticated user's ID

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Optional task description"
}
```

**Request Body Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | 1-200 characters, no HTML |
| description | string | No | Max 1000 characters, no HTML |

**Response**: `201 Created`
```json
{
  "id": 1,
  "user_id": "user-uuid-123",
  "title": "Task title",
  "description": "Optional task description",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": "Bad Request",
  "detail": "Title is required",
  "field": "title"
}
```

`403 Forbidden` - user_id mismatch
```json
{
  "error": "Forbidden",
  "detail": "Cannot create tasks for another user"
}
```

---

#### GET /api/{user_id}/tasks
List all tasks for the authenticated user.

**Authentication**: Required

**Path Parameters:**
- `user_id` (string): Must match the authenticated user's ID

**Query Parameters:**
| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| status | string | "all" | "all", "pending", "completed" | Filter by completion status |
| sort | string | "created" | "created", "updated", "title" | Sort field |
| order | string | "desc" | "asc", "desc" | Sort order |
| limit | integer | 100 | 1-100 | Max tasks to return |
| offset | integer | 0 | 0+ | Pagination offset |

**Example Request:**
```
GET /api/user-uuid-123/tasks?status=pending&sort=created&order=desc
```

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": "user-uuid-123",
      "title": "Task title",
      "description": "Description",
      "completed": false,
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "user_id": "user-uuid-123",
      "title": "Another task",
      "description": "Another description",
      "completed": false,
      "created_at": "2026-01-01T09:00:00Z",
      "updated_at": "2026-01-01T09:00:00Z"
    }
  ],
  "total": 10,
  "pending": 7,
  "completed": 3,
  "limit": 100,
  "offset": 0
}
```

**Error Responses:**

`400 Bad Request` - Invalid query parameter
```json
{
  "error": "Bad Request",
  "detail": "Invalid status filter. Must be: all, pending, or completed"
}
```

---

#### GET /api/{user_id}/tasks/{id}
Get details of a specific task.

**Authentication**: Required

**Path Parameters:**
- `user_id` (string): Must match the authenticated user's ID
- `id` (integer): Task ID

**Response**: `200 OK`
```json
{
  "id": 1,
  "user_id": "user-uuid-123",
  "title": "Task title",
  "description": "Full task description",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z"
}
```

**Error Responses:**

`404 Not Found` - Task doesn't exist or belongs to different user
```json
{
  "error": "Not Found",
  "detail": "Task not found"
}
```

---

#### PUT /api/{user_id}/tasks/{id}
Update a task's title and/or description.

**Authentication**: Required

**Path Parameters:**
- `user_id` (string): Must match the authenticated user's ID
- `id` (integer): Task ID

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description"
}
```

**Request Body Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | 1-200 characters, no HTML |
| description | string | No | Max 1000 characters, no HTML |

**Response**: `200 OK`
```json
{
  "id": 1,
  "user_id": "user-uuid-123",
  "title": "Updated task title",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T11:30:00Z"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": "Bad Request",
  "detail": "Title cannot be empty",
  "field": "title"
}
```

`404 Not Found` - Task doesn't exist
```json
{
  "error": "Not Found",
  "detail": "Task not found"
}
```

---

#### PATCH /api/{user_id}/tasks/{id}/complete
Toggle task completion status.

**Authentication**: Required

**Path Parameters:**
- `user_id` (string): Must match the authenticated user's ID
- `id` (integer): Task ID

**Request Body:**
```json
{
  "completed": true
}
```

**Alternative**: Can be called without body to toggle current status.

**Response**: `200 OK`
```json
{
  "id": 1,
  "user_id": "user-uuid-123",
  "completed": true,
  "updated_at": "2026-01-01T11:35:00Z"
}
```

**Error Responses:**

`404 Not Found` - Task doesn't exist
```json
{
  "error": "Not Found",
  "detail": "Task not found"
}
```

---

#### DELETE /api/{user_id}/tasks/{id}
Delete a task permanently.

**Authentication**: Required

**Path Parameters:**
- `user_id` (string): Must match the authenticated user's ID
- `id` (integer): Task ID

**Response**: `204 No Content`

No response body.

**Error Responses:**

`404 Not Found` - Task doesn't exist
```json
{
  "error": "Not Found",
  "detail": "Task not found"
}
```

---

## Data Models

### Task Model
```typescript
interface Task {
  id: number
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string  // ISO 8601 datetime
  updated_at: string  // ISO 8601 datetime
}
```

### TaskList Response Model
```typescript
interface TaskListResponse {
  tasks: Task[]
  total: number       // Total tasks for user
  pending: number     // Count of incomplete tasks
  completed: number   // Count of completed tasks
  limit: number       // Current limit
  offset: number      // Current offset
}
```

### Error Response Model
```typescript
interface ErrorResponse {
  error: string       // Error type/title
  detail: string      // Human-readable error message
  field?: string      // Field name for validation errors
}
```

## HTTP Status Codes

| Code | Name | Usage |
|------|------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST (task created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input data, validation errors |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but accessing another user's resource |
| 404 | Not Found | Task doesn't exist |
| 422 | Unprocessable Entity | Invalid request format |
| 500 | Internal Server Error | Server-side error |

## Request Validation

### Title Validation
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 200 characters
- **Pattern**: No HTML tags
- **Error Message**: "Title is required and must be 1-200 characters"

### Description Validation
- **Required**: No
- **Max Length**: 1000 characters
- **Pattern**: No HTML tags
- **Error Message**: "Description must be less than 1000 characters"

### user_id Validation
- **Format**: UUID string or alphanumeric
- **Match**: Must match authenticated user's ID
- **Error Message**: "Cannot access another user's tasks"

## Rate Limiting

### Limits (Future Enhancement)
- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Burst: 20 requests

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704110460
```

### Rate Limit Exceeded Response
`429 Too Many Requests`
```json
{
  "error": "Too Many Requests",
  "detail": "Rate limit exceeded. Try again in 30 seconds.",
  "retry_after": 30
}
```

## CORS Configuration

### Allowed Origins
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

### Allowed Methods
`GET, POST, PUT, PATCH, DELETE, OPTIONS`

### Allowed Headers
`Content-Type, Authorization`

### Credentials
`true` (allow cookies and auth headers)

## Example Requests

### Create Task with cURL
```bash
curl -X POST http://localhost:8000/api/user-uuid-123/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "title": "New task",
    "description": "Task description"
  }'
```

### Get Tasks with Filtering
```bash
curl -X GET "http://localhost:8000/api/user-uuid-123/tasks?status=pending&sort=created" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Update Task
```bash
curl -X PUT http://localhost:8000/api/user-uuid-123/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "title": "Updated title",
    "description": "Updated description"
  }'
```

### Delete Task
```bash
curl -X DELETE http://localhost:8000/api/user-uuid-123/tasks/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

## Testing Endpoints

### Test Checklist
- [ ] Health check returns 200
- [ ] Create task without auth returns 401
- [ ] Create task with valid data returns 201
- [ ] Create task with invalid title returns 400
- [ ] Get tasks filters by authenticated user
- [ ] Cannot access another user's tasks (403)
- [ ] Update task updates timestamp
- [ ] Delete task removes from database
- [ ] Pagination works correctly
- [ ] Filtering by status works
- [ ] Sorting works for all fields

## Future Enhancements
- Bulk operations (create/update/delete multiple tasks)
- Task search endpoint
- Task statistics endpoint
- Export tasks to JSON/CSV
- Batch toggle completion
- Undo delete (soft delete)
