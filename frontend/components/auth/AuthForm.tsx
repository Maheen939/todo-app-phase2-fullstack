/**
 * Reusable authentication form for signin and signup
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth-client'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSuccess?: () => void
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        await signUp.email({
          email,
          password,
          name,
        })
      } else {
        await signIn.email({
          email,
          password,
        })
      }

      onSuccess?.()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-gray-900">
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {mode === 'signup' && (
        <Input
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
          autoComplete="name"
        />
      )}

      <Input
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
        autoComplete="email"
      />

      <Input
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="••••••••"
        minLength={8}
        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
      />

      <Button type="submit" fullWidth loading={loading}>
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        {mode === 'signin' ? (
          <>
            New user?{' '}
            <a href="/auth/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </a>
          </>
        ) : (
          <>
            Have an account?{' '}
            <a href="/auth/signin" className="text-blue-600 hover:underline font-medium">
              Sign in
            </a>
          </>
        )}
      </p>
    </form>
  )
}
