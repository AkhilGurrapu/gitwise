import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    // 1. Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('User not authenticated', authError)
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // 2. Get Price ID from environment variables
    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      console.error('Stripe Price ID is not set in environment variables.')
      return NextResponse.json({ error: 'Internal server error: Pricing not configured.' }, { status: 500 })
    }

    // 3. Define success and cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000' // Fallback for safety
    const successUrl = `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/payment/cancelled`

    // 4. Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Include Supabase User ID for webhook identification
      client_reference_id: user.id,
      // Optionally pass customer email if you don't want Stripe to ask for it
      // customer_email: user.email, 
      // We could also pre-fill Stripe customer ID if we store it in Supabase
      // customer: stripeCustomerId // We'll add this logic later if needed
    })

    if (!checkoutSession || !checkoutSession.id) {
        throw new Error('Could not create Stripe Checkout session.')
    }

    // 5. Return the session ID
    return NextResponse.json({ sessionId: checkoutSession.id })

  } catch (error: unknown) {
    console.error('Stripe Checkout Error:', error)
    // Type check before accessing message
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json(
      {
        error: `Internal server error: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
} 