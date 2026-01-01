/**
 * Sign up page
 */

import { AuthForm } from '@/components/auth/AuthForm'
import { Logo } from '@/components/Logo'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-white py-4">
        <div className="container mx-auto px-4">
          <Logo />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <AuthForm mode="signup" />
      </main>
    </div>
  )
}
