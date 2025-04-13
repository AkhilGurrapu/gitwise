import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Ensure environment variables are set
if (!supabaseUrl) {
  throw new Error('Supabase URL is not defined in environment variables.')
}
if (!serviceRoleKey) {
  throw new Error('Supabase Service Role Key is not defined in environment variables.')
}

// Create and export the Supabase admin client
// This client has elevated privileges and should only be used server-side
// for tasks like updating user data from webhooks.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        // Prevent client initialization persistence issues when used server-side
        persistSession: false, 
        // Automatically refresh token is not needed for service role key
        autoRefreshToken: false, 
    }
}); 