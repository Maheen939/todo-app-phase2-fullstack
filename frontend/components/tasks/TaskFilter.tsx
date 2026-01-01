/**
 * Filter and sort controls for task list
 */

'use client'

import type { TaskStatus, SortField } from '@/types'

interface TaskFilterProps {
  filter: TaskStatus
  onFilterChange: (filter: TaskStatus) => void
  sort: SortField
  onSortChange: (sort: SortField) => void
}

export function TaskFilter({ filter, onFilterChange, sort, onSortChange }: TaskFilterProps) {
  const filterButtons: { value: TaskStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ]

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => onFilterChange(btn.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                filter === btn.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortField)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="created">Sort by Date</option>
        <option value="title">Sort by Title</option>
        <option value="updated">Sort by Updated</option>
      </select>
    </div>
  )
}
