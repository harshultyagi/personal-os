import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteProject } from '../actions'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="rounded border px-3 py-1.5 text-sm"
          >
            Edit
          </Link>
          <form action={deleteProject}>
            <input type="hidden" name="id" value={project.id} />
            <button
              type="submit"
              className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <p className="mt-4 text-gray-600">{project.description}</p>
      <div className="mt-4 flex gap-3 text-sm text-gray-500">
        <span>Status: {project.status}</span>
        <span>Priority: {project.priority}</span>
      </div>
    </div>
  )
}