'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    // Optionally handle the error more gracefully
  }

  // Redirect to login page regardless of error for simplicity,
  // or handle error state differently.
  return redirect('/login')
} 