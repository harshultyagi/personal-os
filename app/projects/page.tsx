import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="text-red-600">Failed to load projects: {error.message}</p>
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href="/projects/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">
           + New Project
        </Link>
      </div>
      {projects.length === 0 ? (
        <p className="mt-4 text-gray-500">
          No projects yet. Create your first one to get started.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="rounded border p-4 hover:bg-gray-50">
                <h2 className="font-medium">{project.name}</h2>
                <p className="text-sm text-gray-600">{project.description}</p>
                <p className="mt-1 text-xs text-gray-400">{project.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}