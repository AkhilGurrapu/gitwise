import { createServerClient, type CookieOptions } from '@supabase/ssr'
// Revert back to the specific type import path
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export function createClient(cookieStore: ReadonlyRequestCookies) {
  // Create a server-side client for Supabase that manages cookies
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
             (cookieStore as any).set?.({ name, value, ...options }) // Attempt set, may fail silently in Server Components/Actions
          } catch (error) {
             // Expected error in Server Component/Action context, can ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
             (cookieStore as any).set?.({ name, value: '', ...options }) // Attempt remove via set, may fail silently
          } catch (error) {
             // Expected error in Server Component/Action context, can ignore
          }
        },
      },
    }
  )
} 