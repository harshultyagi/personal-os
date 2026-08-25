import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { updateProject } from '../../actions'

export default async function EditProjectPage({
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

  if (error || !project) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Edit Project</h1>

      <form action={updateProject} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={project.id} />

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            defaultValue={project.name}
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={project.description}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue={project.status}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Priority</label>
          <select
            name="priority"
            defaultValue={project.priority}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Save Changes
        </button>
      </form>
    </div>
  )
}