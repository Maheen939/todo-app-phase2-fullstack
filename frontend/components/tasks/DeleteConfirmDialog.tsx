/**
 * Confirmation dialog for task deletion
 */

'use client'

import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface DeleteConfirmDialogProps {
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({ taskTitle, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <Modal title="Delete Task" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete <strong className="text-gray-900">{taskTitle}</strong>?
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
