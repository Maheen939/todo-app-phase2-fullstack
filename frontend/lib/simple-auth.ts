/**
 * Simplified authentication system for demo/testing
 * Generates JWT tokens compatible with backend
 */

'use client'

// Mock user session stored in localStorage
export interface User {
  id: string
  email: string
  name: string
  token: string
}

// Simple JWT encoding (matches backend format)
function createJWT(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '')

  // For demo: we don't actually sign it (backend would reject in production)
  // In real app, backend generates the JWT after validating credentials
  const signature = 'mock-signature'

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export const simpleAuth = {
  // Sign up (creates mock user and JWT)
  async signUp(email: string, password: string, name: string): Promise<User> {
    const userId = `user-${Date.now()}`
    const now = Math.floor(Date.now() / 1000)

    // Create JWT payload matching backend expectations
    const payload = {
      sub: userId,  // User ID in 'sub' claim
      email: email,
      iat: now,     // Issued at
      exp: now + 86400  // Expires in 24 hours (in seconds)
    }

    const token = createJWT(payload)

    const user: User = {
      id: userId,
      email,
      name,
      token
    }

    localStorage.setItem('user', JSON.stringify(user))
    return user
  },

  // Sign in (validates and returns mock user)
  async signIn(email: string, password: string): Promise<User> {
    // Check if user already exists in localStorage
    const existingUserStr = localStorage.getItem('user')
    if (existingUserStr) {
      const existingUser = JSON.parse(existingUserStr)
      if (existingUser.email === email) {
        // Return existing user (re-use same ID)
        const now = Math.floor(Date.now() / 1000)
        const payload = {
          sub: existingUser.id,
          email: email,
          iat: now,
          exp: now + 86400
        }

        const token = createJWT(payload)
        existingUser.token = token
        localStorage.setItem('user', JSON.stringify(existingUser))
        return existingUser
      }
    }

    // Create new user
    const userId = `user-${Date.now()}`
    const now = Math.floor(Date.now() / 1000)

    const payload = {
      sub: userId,
      email: email,
      iat: now,
      exp: now + 86400
    }

    const token = createJWT(payload)

    const user: User = {
      id: userId,
      email,
      name: email.split('@')[0],
      token
    }

    localStorage.setItem('user', JSON.stringify(user))
    return user
  },

  // Sign out
  signOut() {
    localStorage.removeItem('user')
  },

  // Get current user
  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Get session
  getSession(): { user: User; session: { token: string } } | null {
    const user = this.getUser()
    if (!user) return null
    return {
      user,
      session: { token: user.token }
    }
  }
}
