/**
 * Simplified auth client for demo/testing
 * Replace with Better Auth in production
 */

'use client'

import { simpleAuth } from './simple-auth'
import { useState, useEffect } from 'react'

export const authClient = {
  signIn: {
    async email({ email, password }: { email: string; password: string }) {
      return simpleAuth.signIn(email, password)
    }
  },
  signUp: {
    async email({ email, password, name }: { email: string; password: string; name: string }) {
      return simpleAuth.signUp(email, password, name)
    }
  },
  signOut: () => {
    simpleAuth.signOut()
  },
  getSession: () => {
    return simpleAuth.getSession()
  }
}

export const { signIn, signUp, signOut } = authClient

// Custom hook for session
export function useSession() {
  const [session, setSession] = useState<ReturnType<typeof simpleAuth.getSession>>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    setSession(simpleAuth.getSession())
    setIsPending(false)
  }, [])

  return { data: session, isPending }
}
