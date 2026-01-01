/**
 * Navbar component with authentication state
 */

'use client'

import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from './ui/Button'
import { Logo } from './Logo'

export function Navbar() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (isPending) {
    return (
      <nav className="border-b bg-white">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <Logo />
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Logo />
        {session?.user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {session.user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
            <Button onClick={() => router.push('/auth/signup')}>Sign Up</Button>
          </div>
        )}
      </div>
    </nav>
  )
}
