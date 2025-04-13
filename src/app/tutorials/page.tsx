import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type Module } from '@/lib/types' // We'll define this type next

async function fetchModules(supabase: ReturnType<typeof createClient>): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('id, title, description, slug')
      .order('order', { ascending: true })

    if (error) {
        console.error('Error fetching modules for page:', error)
        return [] // Return empty array on error
    }
    // Ensure data is not null and fits the expected type (or cast carefully)
    return (data as Module[] | null) ?? []
}

export default async function TutorialsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const modules = await fetchModules(supabase)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Tutorials</h1>

      {modules.length === 0 ? (
        <p className="text-center text-gray-600">No tutorials available yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link 
              key={module.id} 
              href={`/tutorials/${module.slug}`} 
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{module.title}</h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">{module.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 