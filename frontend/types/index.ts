/**
 * TypeScript type definitions for the Todo application.
 */

export interface Task {
  id: number
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  pending: number
  completed: number
}

export interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  user: User
  session: {
    token: string
    userId: string
    expiresAt: string
  }
}

export type TaskStatus = 'all' | 'pending' | 'completed'
export type SortField = 'created' | 'updated' | 'title'
export type SortOrder = 'asc' | 'desc'
