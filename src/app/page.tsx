import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from "@/components/auth/LogoutButton";
import { signOut } from "@/lib/auth/actions";
import Link from "next/link";
import ManageSubscriptionButton from '@/components/profile/ManageSubscriptionButton';

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_subscribed, stripe_customer_id')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
        console.error('Error fetching profile:', profileError)
    } else {
        profile = userProfile
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 dark:bg-gray-900">
      {user ? (
        <div className="container mx-auto px-6 py-8 text-center">
            <p className="mb-4">Welcome back, {user.email}!</p>
            <div className="flex justify-center items-center space-x-4">
                <LogoutButton signOutAction={signOut} />
                {profile?.is_subscribed && profile?.stripe_customer_id && (
                    <ManageSubscriptionButton />
                )}
                {!profile?.is_subscribed && (
                    <Link href="/subscribe" className="ml-4 px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700">Subscribe</Link>
                )}
                 <Link href="/tutorials" className="ml-4 px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">Browse Tutorials</Link>
            </div>
        </div>
      ) : (
        <>
          <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-indigo-100 via-white to-sky-100 dark:from-indigo-900/30 dark:via-gray-900 dark:to-sky-900/30">
            <div className="container px-4 md:px-6 text-center">
              <div className="max-w-3xl mx-auto space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-gray-900 dark:text-gray-100">
                  Master Git & GitHub, Visually.
                </h1>
                <p className="text-lg text-gray-600 md:text-xl dark:text-gray-400">
                  Learn complex workflows through interactive tutorials, safe sandboxing, and AI-powered guidance. Build enterprise-ready skills, faster.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                  <Link
                    href="/login?signup=true"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-indigo-500 dark:text-gray-900 dark:hover:bg-indigo-400 dark:focus-visible:ring-indigo-600"
                  >
                    Start Learning for Free
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-white dark:bg-gray-800">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 sm:text-4xl text-gray-900 dark:text-gray-100">How Gitwise Helps You Learn</h2>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center text-center p-6 rounded-lg border dark:border-gray-700">
                  <div className="mb-4 rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/50">
                     <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Interactive Tutorials</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Step-by-step guides with instant visual feedback on repository state after each command.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-lg border dark:border-gray-700">
                  <div className="mb-4 rounded-full bg-sky-100 p-3 dark:bg-sky-900/50">
                     <span className="text-2xl">🧪</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Git Sandbox</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Practice commands freely in a safe, isolated environment without affecting real projects.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-lg border dark:border-gray-700">
                  <div className="mb-4 rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/50">
                     <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">AI Git Advisor</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get intelligent suggestions and best practice tips based on the commands you use.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-16 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-900">
             <div className="container px-4 md:px-6 text-center">
               <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6 text-gray-900 dark:text-gray-100">
                  Ready to Elevate Your Git Skills?
               </h2>
               <Link
                 href="/login?signup=true"
                 className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-indigo-500 dark:text-gray-900 dark:hover:bg-indigo-400 dark:focus-visible:ring-indigo-600"
               >
                 Sign Up Now
               </Link>
             </div>
          </section>
        </>
      )}
    </main>
  );
}
