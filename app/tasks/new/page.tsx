import { createClient } from '@/utils/supabase/server'
import { createTask } from '../actions'

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; title?: string; due_date?: string; priority?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('id, name').order('name')

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">New Task</h1>

      {params.error && (
        <p className="mt-4 rounded bg-red-50 p-2 text-sm text-red-600">{params.error}</p>
      )}

      <form action={createTask} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            defaultValue={params.title ?? ''}
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Project (optional)</label>
          <select name="project_id" defaultValue="" className="mt-1 w-full rounded border px-3 py-2">
            <option value="">No project</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select name="status" defaultValue="todo" className="mt-1 w-full rounded border px-3 py-2">
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Priority</label>
          <select
            name="priority"
            defaultValue={params.priority ?? 'medium'}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Due Date</label>
          <input
            type="date"
            name="due_date"
            defaultValue={params.due_date ?? ''}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Create Task
        </button>
      </form>
    </div>
  )
}