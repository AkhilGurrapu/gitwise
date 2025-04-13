'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthForm from '@/components/auth/AuthForm'

// --- Server Action for Sign Out (REMOVED - Moved to src/lib/auth/actions.ts) ---
// async function signOut() { ... } // Definition removed from here
// --- End Server Action ---

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAuthAction = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let response
      if (isSigningUp) {
        response = await supabase.auth.signUp({
          email,
          password,
        })
      } else {
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        })
      }

      if (response.error) {
        throw response.error
      }

      router.push('/')
      router.refresh()

    } catch (error: any) {
      console.error('Authentication error:', error)
      setError(error.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">
          {isSigningUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        <AuthForm
          isSigningUp={isSigningUp}
          onSubmit={handleAuthAction}
          isLoading={isLoading}
        />

        {error && (
          <p className="mt-2 text-center text-sm text-red-600">{error}</p>
        )}

        <p className="text-sm text-center text-gray-600">
          {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSigningUp(!isSigningUp)
              setError(null)
            }}
            disabled={isLoading}
            className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
          >
            {isSigningUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
} 