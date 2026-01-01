/**
 * Task list component with filtering and sorting
 */

'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Task, TaskStatus, SortField } from '@/types'
import { TaskItem } from './TaskItem'
import { AddTaskButton } from './AddTaskButton'
import { TaskFilter } from './TaskFilter'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'

interface TaskListProps {
  userId: string
}

export function TaskList({ userId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<TaskStatus>('all')
  const [sort, setSort] = useState<SortField>('created')
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 })

  useEffect(() => {
    loadTasks()
  }, [filter, sort, userId])

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getTasks(userId, { status: filter, sort, order: 'desc' })
      setTasks(data.tasks)
      setStats({ total: data.total, pending: data.pending, completed: data.completed })
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadTasks}
          className="text-blue-600 hover:underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (tasks.length === 0 && filter === 'all') {
    return <EmptyState onAddTask={loadTasks} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <AddTaskButton userId={userId} onSuccess={loadTasks} />
      </div>

      <TaskFilter
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filter !== 'all' && filter} tasks found
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} userId={userId} onUpdate={loadTasks} />
          ))}
        </div>
      )}

      <div className="text-sm text-gray-600 text-center pt-4">
        Showing {tasks.length} of {stats.total} task{stats.total !== 1 ? 's' : ''} ·
        {stats.pending} pending · {stats.completed} completed
      </div>
    </div>
  )
}
