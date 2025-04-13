import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Lesson, type Step } from '@/lib/types'
import GitVisualization from '@/components/tutorials/GitVisualization'
// We might need a Markdown renderer later
// import ReactMarkdown from 'react-markdown' 

// Define the specific PageProps type for this page
interface PageProps {
  params: {
    moduleSlug: string;
    lessonSlug: string;
    stepOrder: string;
  };
  // Explicitly include optional searchParams to match Next.js type signature fully
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Function to fetch lesson details by slug
async function fetchLesson(supabase: ReturnType<typeof createClient>, slug: string): Promise<Lesson | null> {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, module_id, slug') // Fetch necessary fields
      .eq('slug', slug)
      .single();
  
    if (error) {
      console.error('Error fetching lesson details:', error);
      return null;
    }
    return data as Lesson | null;
}

// Function to fetch a specific step details by lesson ID and order
async function fetchStep(supabase: ReturnType<typeof createClient>, lessonId: string, order: number): Promise<Step | null> {
    const { data, error } = await supabase
        .from('steps')
        .select('*') // Select all step fields for now
        .eq('lesson_id', lessonId)
        .eq('order', order)
        .single();

    if (error) {
        console.error(`Error fetching step ${order} for lesson ${lessonId}:`, error);
        return null;
    }
    return data as Step | null;
}

// Function to get the total number of steps in a lesson
async function countSteps(supabase: ReturnType<typeof createClient>, lessonId: string): Promise<number> {
    const { count, error } = await supabase
        .from('steps')
        .select('*' , { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

    if (error) {
        console.error(`Error counting steps for lesson ${lessonId}:`, error);
        return 0;
    }
    return count ?? 0;
}

// Use the explicit PageProps type, accepting searchParams
export default async function StepPage({ params, searchParams }: PageProps) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { moduleSlug, lessonSlug, stepOrder } = params;
  const currentStepOrder = parseInt(stepOrder, 10);

  // Validate stepOrder is a number
  if (isNaN(currentStepOrder) || currentStepOrder < 1) {
      notFound();
  }

  // Fetch lesson details first to get lessonId
  const lesson = await fetchLesson(supabase, lessonSlug);
  if (!lesson) {
    notFound();
  }

  // Fetch current step details
  const step = await fetchStep(supabase, lesson.id, currentStepOrder);
  if (!step) {
    notFound();
  }

  // Get total number of steps for pagination
  const totalSteps = await countSteps(supabase, lesson.id);

  const hasPreviousStep = currentStepOrder > 1;
  const hasNextStep = currentStepOrder < totalSteps;

  // Prepare nodes and edges for the visualization component, handle null case
  const vizNodes = step.visualization_data?.nodes ?? [];
  const vizEdges = step.visualization_data?.edges ?? [];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Main Content Area */}
      <div className="flex-grow md:w-2/3">
        {/* Breadcrumbs/Header */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/tutorials" className="hover:underline">Tutorials</Link> &gt; 
          <Link href={`/tutorials/${moduleSlug}`} className="hover:underline">{moduleSlug}</Link> &gt; 
          <span title={lesson.title}>{lessonSlug}</span> (Step {currentStepOrder}/{totalSteps})
        </div>
        
        {/* Step Content */} 
        <div className="prose dark:prose-invert max-w-none mb-6"> 
          {/* Render Markdown if needed: <ReactMarkdown>{step.content}</ReactMarkdown> */}
          {step.content ? <p>{step.content}</p> : <p>No content for this step.</p>} 
        </div>

        {/* Git Command */}
        {step.git_command && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Command:</h3>
            <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
              <code>{step.git_command}</code>
            </pre>
          </div>
        )}

        {/* Expected Output */}
        {step.expected_output && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Expected Output:</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-4 rounded-md overflow-x-auto text-sm">
              <code>{step.expected_output}</code>
            </pre>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 border-t pt-4">
          <div>
            {hasPreviousStep ? (
              <Link href={`/tutorials/${moduleSlug}/${lessonSlug}/${currentStepOrder - 1}`} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                &larr; Previous
              </Link>
            ) : (
              <span className="px-4 py-2 text-gray-400 dark:text-gray-500 cursor-not-allowed"> &larr; Previous</span> 
            )}
          </div>
          <div>
            {hasNextStep ? (
              <Link href={`/tutorials/${moduleSlug}/${lessonSlug}/${currentStepOrder + 1}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Next &rarr;
              </Link>
            ) : (
                <span className="px-4 py-2 text-gray-400 dark:text-gray-500 cursor-not-allowed">Next &rarr;</span> 
            )}
          </div>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="md:w-1/3 border-l pl-8 flex flex-col" style={{minHeight: '400px'}}> {/* Ensure container has height */}
        <h3 className="text-xl font-semibold mb-4 flex-shrink-0">Git Visualization</h3>
        <div className="flex-grow border rounded bg-gray-50 dark:bg-gray-800">
          {/* Render the visualization component */}
          {(vizNodes.length > 0 || vizEdges.length > 0) ? (
            <GitVisualization nodes={vizNodes} edges={vizEdges} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No visualization for this step.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 