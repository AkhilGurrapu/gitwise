// import { headers } from 'next/headers' // Use req.headers instead
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin' // Import Supabase Admin client

// Get webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Configure the route to handle raw body parsing
// export const config = { api: { bodyParser: false } }; // Not needed in App Router

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error('Stripe webhook secret is not set.')
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 })
  }

  const body = await req.text() // Read the raw body
  // Get signature from request headers
  const signature = req.headers.get('Stripe-Signature') as string 

  if (!signature) {
    console.error('Stripe-Signature header missing.')
    return NextResponse.json({ error: 'Webhook Error: Missing Stripe-Signature header.' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', err)
    let errorMessage = 'Unknown webhook error'
    if (err instanceof Error) {
        errorMessage = err.message
    }
    // It's good practice to include the specific error type if possible
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
        errorMessage = `Webhook signature verification failed: ${errorMessage}`
    }
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 })
  }

  // Successfully constructed event
  console.log('Stripe Webhook Event Received:', event.type)

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id
      const stripeCustomerId = session.customer as string | null
      const stripeSubscriptionId = session.subscription as string | null

      console.log('Processing checkout.session.completed for user:', userId)
      console.log('Stripe Customer ID:', stripeCustomerId)
      console.log('Subscription ID:', stripeSubscriptionId)

      if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        console.error('Missing data in checkout session event', { userId, stripeCustomerId, stripeSubscriptionId })
        return NextResponse.json({ error: 'Webhook Error: Missing data in event' }, { status: 400 })
      }

      // --- Update Supabase User Record --- 
      try {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            is_subscribed: true,
            subscription_status: 'active', // Or fetch from subscription object if needed
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
          })
          .eq('id', userId)

        if (updateError) {
          console.error(`Supabase update error for user ${userId}:`, updateError)
          // Decide if you should return 500 or let Stripe retry (by returning non-200)
          // For now, log error but still return 200 to acknowledge receipt
          // return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        } else {
          console.log(`Successfully updated subscription status for user ${userId}`)
        }
      } catch (dbError: unknown) {
          console.error('Error updating database:', dbError)
          // Type check if needed, though less critical here as we just log
          // return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
      }
      // -----------------------------------------
      break
    
    // case 'invoice.payment_succeeded':
    //   // Handle successful recurring payment (e.g., ensure subscription is still active)
    //   const invoice = event.data.object as Stripe.Invoice;
    //   console.log('Invoice payment succeeded for subscription:', invoice.subscription);
    //   // TODO: Update subscription renewal date or confirm status in DB
    //   break;

    // case 'invoice.payment_failed':
    //   // Handle failed recurring payment (e.g., notify user, update subscription status)
    //   const failedInvoice = event.data.object as Stripe.Invoice;
    //   console.log('Invoice payment failed for subscription:', failedInvoice.subscription);
    //   // TODO: Update subscription status in DB (e.g., 'past_due') and potentially notify user
    //   break;
      
    // case 'customer.subscription.deleted':
    //   // Handle subscription cancellation
    //   const deletedSubscription = event.data.object as Stripe.Subscription;
    //   console.log('Subscription deleted:', deletedSubscription.id);
    //   // TODO: Update subscription status in DB (e.g., 'cancelled')
    //   break;

    // ... handle other event types as needed

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true })
} 