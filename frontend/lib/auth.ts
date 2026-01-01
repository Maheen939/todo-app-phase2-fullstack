/**
 * Simplified auth for server-side
 * Replace with Better Auth in production
 */

import { cookies } from 'next/headers'

export const auth = {
  api: {
    async getSession({ headers }: any) {
      // Simple session check (mock for demo)
      return null // Will use client-side auth for demo
    }
  }
}
