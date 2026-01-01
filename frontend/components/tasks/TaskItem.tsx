/**
 * Individual task item component
 */

'use client'

import { useState } from 'react'
import type { Task } from '@/types'
import { api } from '@/lib/api'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { EditTaskModal } from './EditTaskModal'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

interface TaskItemProps {
  task: Task
  userId: string
  onUpdate: () => void
}

export function TaskItem({ task, userId, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleComplete = async () => {
    setLoading(true)
    try {
      await api.toggleTaskComplete(userId, task.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to toggle task:', error)
    } finally {
      setLoading(false)
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

  const createdDate = new Date(task.created_at).toLocaleDateString()

  return (
    <>
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={task.completed}
              onChange={handleToggleComplete}
              disabled={loading}
              aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-gray-900 ${
                task.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">{createdDate}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
              aria-label="Edit task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => setIsDeleting(true)}
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
              aria-label="Delete task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
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
