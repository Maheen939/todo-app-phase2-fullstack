/**
 * API client for communicating with the FastAPI backend.
 * All functions require authentication and automatically include JWT token.
 */

import { authClient } from './auth-client'
import type { Task, TaskListResponse, TaskStatus, SortField, SortOrder } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Get authentication headers with JWT token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await authClient.getSession()

  if (!session?.session?.token) {
    throw new Error('No authentication token. Please sign in.')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.session.token}`,
  }
}

/**
 * Handle API errors
 */
function handleError(error: any): never {
  if (error instanceof Error) {
    throw error
  }
  throw new Error('An unexpected error occurred')
}

export const api = {
  /**
   * Get all tasks for the authenticated user
   */
  async getTasks(
    userId: string,
    params?: {
      status?: TaskStatus
      sort?: SortField
      order?: SortOrder
      limit?: number
      offset?: number
    }
  ): Promise<TaskListResponse> {
    try {
      const headers = await getAuthHeaders()
      const queryParams = new URLSearchParams()

      if (params?.status) queryParams.append('status', params.status)
      if (params?.sort) queryParams.append('sort', params.sort)
      if (params?.order) queryParams.append('order', params.order)
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.offset) queryParams.append('offset', params.offset.toString())

      const url = `${API_BASE_URL}/api/${userId}/tasks?${queryParams.toString()}`
      const response = await fetch(url, { headers })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to fetch tasks')
      }

      return response.json()
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Create a new task
   */
  async createTask(
    userId: string,
    data: { title: string; description?: string }
  ): Promise<Task> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create task')
      }

      return response.json()
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Get a specific task by ID
   */
  async getTask(userId: string, taskId: number): Promise<Task> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
        headers,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to fetch task')
      }

      return response.json()
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Update a task
   */
  async updateTask(
    userId: string,
    taskId: number,
    data: { title: string; description?: string }
  ): Promise<Task> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update task')
      }

      return response.json()
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskComplete(userId: string, taskId: number): Promise<Task> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to toggle task')
      }

      return response.json()
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(userId: string, taskId: number): Promise<void> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to delete task')
      }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)

      if (!response.ok) {
        throw new Error('Health check failed')
      }

      return response.json()
    } catch (error) {
      return handleError(error)
    }
  },
}
