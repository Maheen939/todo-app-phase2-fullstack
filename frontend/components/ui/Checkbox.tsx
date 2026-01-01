/**
 * Checkbox component
 */

import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className={`
          w-5 h-5 text-blue-600 border-gray-300 rounded
          focus:ring-blue-500 focus:ring-2
          cursor-pointer
          ${className}
        `}
        {...props}
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
}
