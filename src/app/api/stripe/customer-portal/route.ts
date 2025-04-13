import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // Use server client for auth + profile fetch
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Portal Error: User not authenticated', authError)
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // 2. Get Stripe Customer ID from user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single() // Expect only one profile per user

    if (profileError || !profile || !profile.stripe_customer_id) {
      console.error(`Portal Error: Failed to retrieve Stripe Customer ID for user ${user.id}`, profileError)
      return NextResponse.json({ error: 'Failed to find subscription details.' }, { status: 500 })
    }

    const stripeCustomerId = profile.stripe_customer_id

    // 3. Define the return URL (where user comes back to after portal)
    const origin = req.headers.get('origin') || 'http://localhost:3000' // Fallback for safety
    const returnUrl = `${origin}/` // Send them back to the homepage for now

    // 4. Create Stripe Billing Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    })

    if (!portalSession || !portalSession.url) {
        throw new Error('Could not create Stripe Customer Portal session.')
    }

    // 5. Return the session URL
    return NextResponse.json({ url: portalSession.url })

  } catch (error: unknown) {
    console.error('Stripe Portal Session Error:', error)
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