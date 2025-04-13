// import { headers } from 'next/headers' // Use req.headers instead
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin' // Import Supabase Admin client

// Get webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Configure the route to handle raw body parsing
// export const config = { api: { bodyParser: false } }; // Not needed in App Router

// Helper function to update user profile based on Stripe customer ID
async function updateUserProfileByCustomerId(customerId: string, dataToUpdate: Record<string, any>) {
  console.log(`Attempting to update profile for customer: ${customerId}`);
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(dataToUpdate)
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error(`Supabase update error for customer ${customerId}:`, error);
    // Optionally throw error to signal failure to Stripe, causing retry
    // throw error; 
  } else {
    console.log(`Successfully updated profile for customer ${customerId}`);
  }
}

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

  let relevantCustomerId: string | null | undefined;

  // Handle the event
  try { // Add top-level try-catch for event processing logic
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session
          const userId = session.client_reference_id
          const stripeCustomerIdCheckout = session.customer as string | null
          const stripeSubscriptionId = session.subscription as string | null

          console.log('Processing checkout.session.completed for user:', userId)

          if (!userId || !stripeCustomerIdCheckout || !stripeSubscriptionId) {
            console.error('Missing data in checkout session event', { userId, stripeCustomerIdCheckout, stripeSubscriptionId })
            return NextResponse.json({ error: 'Webhook Error: Missing data in event' }, { status: 400 })
          }

          // Update using user ID from checkout session
          const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({
                is_subscribed: true,
                subscription_status: 'active', // Assuming checkout completion means active
                stripe_customer_id: stripeCustomerIdCheckout,
                stripe_subscription_id: stripeSubscriptionId,
              })
              .eq('id', userId)

          if (updateError) {
            console.error(`Supabase update error for user ${userId}:`, updateError)
          } else {
            console.log(`Successfully updated subscription status for user ${userId}`)
          }
          break;

        case 'customer.subscription.updated':
          const subscriptionUpdated = event.data.object as Stripe.Subscription;
          relevantCustomerId = subscriptionUpdated.customer as string;
          console.log(`Processing customer.subscription.updated for customer: ${relevantCustomerId}`);
          console.log(`Subscription status: ${subscriptionUpdated.status}, Cancel at period end: ${subscriptionUpdated.cancel_at_period_end}`);
          
          await updateUserProfileByCustomerId(relevantCustomerId, {
            is_subscribed: subscriptionUpdated.status === 'active' || subscriptionUpdated.status === 'trialing',
            subscription_status: subscriptionUpdated.status,
            stripe_subscription_id: subscriptionUpdated.id, // Ensure subscription ID is also stored
          });
          break;

        case 'customer.subscription.deleted':
          const subscriptionDeleted = event.data.object as Stripe.Subscription;
          relevantCustomerId = subscriptionDeleted.customer as string;
          console.log(`Processing customer.subscription.deleted for customer: ${relevantCustomerId}`);

          await updateUserProfileByCustomerId(relevantCustomerId, {
            is_subscribed: false,
            subscription_status: 'cancelled', // Use 'cancelled' or subscriptionDeleted.status
            // Optionally clear stripe_subscription_id or keep for history
            // stripe_subscription_id: null,
          });
          break;
        
        // Add cases for invoice.payment_failed etc. later if needed

        default:
          console.log(`Unhandled event type ${event.type}`)
      }
  } catch (processingError: unknown) {
        console.error(`Error processing webhook event ${event.id} of type ${event.type}:`, processingError);
        // Return 500 to indicate failure to process, Stripe might retry
        return NextResponse.json({ error: 'Webhook handler failed to process event.' }, { status: 500 })
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true })
} 