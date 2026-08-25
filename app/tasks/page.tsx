import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { toggleTaskStatus } from './actions'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*, projects(name)')
    .order('due_date', { ascending: true, nullsFirst: false })
    .returns<Array<{ id: string; title: string; status: string; priority: string; due_date: string | null; projects: { name: string } | null }>>()

  if (error) return <p className="text-red-600">Failed to load: {error.message}</p>

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Link href="/tasks/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">
          + New Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-4 text-gray-500">No tasks yet.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded border p-3">
              <form action={toggleTaskStatus}>
                <input type="hidden" name="id" value={task.id} />
                <input type="hidden" name="currentStatus" value={task.status} />
                <button
                  type="submit"
                  className={`h-5 w-5 rounded border ${
                    task.status === 'done' ? 'bg-black' : 'bg-white'
                  }`}
                  aria-label="Toggle done"
                />
              </form>

              <Link href={`/tasks/${task.id}`} className="flex-1">
                <p className={task.status === 'done' ? 'text-gray-400 line-through' : ''}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-400">
                  {task.projects?.name && `${task.projects.name} · `}
                  {task.due_date && `due ${task.due_date} · `}
                  {task.priority}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}