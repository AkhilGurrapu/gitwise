'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// Load Stripe.js outside of the component to avoid recreating on every render
// Use assert non-null (!) since we check for the key existence
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubscribePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribeClick = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Call your API route to create the checkout session
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Optionally pass any necessary data in the body
        // body: JSON.stringify({ items: [{ id: 'your_item_id' }] }),
      })

      const session = await response.json()

      if (!response.ok || !session.sessionId) {
        throw new Error(session.error || 'Failed to create checkout session.')
      }

      // 2. Get Stripe.js instance
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe.js failed to load.')
      }

      // 3. Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      })

      // If `redirectToCheckout` fails due to browser compatibility or configuration issue,
      // display the error message.
      if (stripeError) {
        throw new Error(`Stripe redirect error: ${stripeError.message}`)
      }

      // If redirect is successful, the user won't see this part.
      // If it fails for other reasons before redirect, the catch block handles it.

    } catch (err: unknown) {
      console.error('Subscription Error:', err)
      // Type check before accessing message
      let errorMessage = 'An unexpected error occurred during subscription.'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setIsLoading(false) // Ensure loading state is reset on error
    }
    // setIsLoading(false) should likely not be set here if redirect is successful
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Subscribe to Gitwise Pro</h1>
      <div className="max-w-sm mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Pro Plan</h2>
        <p className="text-gray-600 mb-4">Unlock all interactive tutorials, advanced simulations, and the AI Git Advisor.</p>
        {/* Display a placeholder price - ideally fetch this from Stripe later */}
        <p className="text-2xl font-bold mb-6">$10 / month</p>

        <button
          onClick={handleSubscribeClick}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Subscribe Now'}
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
} 