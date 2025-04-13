import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // Use server client as it handles cookies

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data: modules, error } = await supabase
      .from('modules')
      .select('id, title, description, slug')
      .order('order', { ascending: true })

    if (error) {
      console.error('Error fetching modules:', error)
      throw error; // Let the catch block handle it
    }

    return NextResponse.json(modules)

  } catch (error: unknown) {
    console.error('API Error fetching modules:', error)
    let errorMessage = 'Failed to fetch tutorial modules.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 