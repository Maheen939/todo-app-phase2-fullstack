/**
 * Empty state when no tasks exist
 */

'use client'

import { Button } from '../ui/Button'

interface EmptyStateProps {
  onAddTask: () => void
}

export function EmptyState({ onAddTask }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
      <p className="text-gray-600 mb-6">Create your first task to get started</p>
      <Button onClick={onAddTask}>+ Add Task</Button>
    </div>
  )
}
