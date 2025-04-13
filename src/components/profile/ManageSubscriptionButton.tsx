'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ManageSubscriptionButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleManageSubscription = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Call the API route to create the portal session
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const session = await response.json()

      if (!response.ok || !session.url) {
        throw new Error(session.error || 'Failed to create customer portal session.')
      }

      // 2. Redirect to the Stripe Customer Portal URL
      // Use router.push for client-side redirect to an external URL
      router.push(session.url) 
      // Note: setLoading(false) won't be reached if redirect is successful

    } catch (err: unknown) {
      console.error('Manage Subscription Error:', err)
      let errorMessage = 'An unexpected error occurred.'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setIsLoading(false) // Reset loading state on error
    }
  }

  return (
    <>
      <button
        onClick={handleManageSubscription}
        disabled={isLoading}
        className="ml-4 px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Manage Subscription'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">Error: {error}</p>}
    </>
  )
} 