/**
 * Add task button and modal
 */

'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'
import { AddTaskModal } from './AddTaskModal'

interface AddTaskButtonProps {
  userId: string
  onSuccess: () => void
}

export function AddTaskButton({ userId, onSuccess }: AddTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ Add Task</Button>

      {isOpen && (
        <AddTaskModal
          userId={userId}
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false)
            onSuccess()
          }}
        />
      )}
    </>
  )
}
