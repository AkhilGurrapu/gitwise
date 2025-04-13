import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Module, type Lesson } from '@/lib/types'

// Function to fetch module details by slug
async function fetchModule(supabase: ReturnType<typeof createClient>, slug: string): Promise<Module | null> {
  const { data, error } = await supabase
    .from('modules')
    .select('id, title, description, slug')
    .eq('slug', slug)
    .single(); // Expect only one module per slug

  if (error) {
    console.error('Error fetching module details:', error);
    return null;
  }
  return data as Module | null;
}

// Function to fetch lessons for a given module ID
async function fetchLessons(supabase: ReturnType<typeof createClient>, moduleId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, description, slug, order') // Select necessary lesson fields
    .eq('module_id', moduleId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching lessons for module:', moduleId, error);
    return [];
  }
  return (data as Lesson[] | null) ?? [];
}

// Use 'any' for props as a workaround for the persistent build type error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ModuleLessonsPage(props: any) {
    // Manually extract params, assuming the structure is correct at runtime
    const params = props.params as { 
        moduleSlug: string;
    } | undefined;

    // Validate params exist
    if (!params) {
        console.error("Error: Page parameters are missing.");
        notFound(); // Or handle differently
    }
    
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { moduleSlug } = params; // Destructure after validation

  // Fetch module details
  const currentModule = await fetchModule(supabase, moduleSlug)

  // If module not found, show 404
  if (!currentModule) {
    notFound();
  }

  // Fetch lessons for this module
  const lessons = await fetchLessons(supabase, currentModule.id)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Module Header */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">{currentModule.title}</h1>
        {currentModule.description && (
          <p className="text-lg text-gray-600">{currentModule.description}</p>
        )}
      </div>

      {/* Lessons List */}
      <h2 className="text-2xl font-semibold mb-6">Lessons</h2>
      {lessons.length === 0 ? (
        <p className="text-gray-600">No lessons available for this module yet.</p>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              // Link to the first step (order 1) of the lesson for now
              href={`/tutorials/${currentModule.slug}/${lesson.slug}/1`}
              className="block p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors duration-150"
            >
              <h3 className="text-xl font-medium text-gray-900">{lesson.title}</h3>
              {lesson.description && (
                <p className="mt-1 text-sm text-gray-500">{lesson.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Back link */}
      <div className="mt-8">
        <Link href="/tutorials" className="text-blue-600 hover:underline">
          &larr; Back to all tutorials
        </Link>
      </div>
    </div>
  )
} 