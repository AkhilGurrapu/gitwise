import Stripe from 'stripe'

// Ensure the secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Stripe secret key is not defined in environment variables.')
}

// Initialize Stripe with the secret key
// The library will use its default API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // apiVersion: '2024-04-10', // Remove explicit version to use library default
  typescript: true,
}) 