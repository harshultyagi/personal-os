import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { updateTask } from '../../actions'

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !task) notFound()

  const { data: projects } = await supabase.from('projects').select('id, name').order('name')

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Edit Task</h1>

      <form action={updateTask} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={task.id} />

        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" defaultValue={task.title} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Project (optional)</label>
          <select name="project_id" defaultValue={task.project_id ?? ''} className="mt-1 w-full rounded border px-3 py-2">
            <option value="">No project</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select name="status" defaultValue={task.status} className="mt-1 w-full rounded border px-3 py-2">
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Priority</label>
          <select name="priority" defaultValue={task.priority} className="mt-1 w-full rounded border px-3 py-2">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Due Date</label>
          <input type="date" name="due_date" defaultValue={task.due_date ?? ''} className="mt-1 w-full rounded border px-3 py-2" />
        </div>

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Save Changes
        </button>
      </form>
    </div>
  )
}