import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteTask } from '../actions'

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, projects(name)')
    .eq('id', id)
    .returns<Array<{ id: string; title: string; status: string; priority: string; due_date: string | null; projects: { name: string } | null }>>()
    .single()
  if (error || !task) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <div className="flex gap-2">
          <Link href={`/tasks/${task.id}/edit`} className="rounded border px-3 py-1.5 text-sm">
            Edit
          </Link>
          <form action={deleteTask}>
            <input type="hidden" name="id" value={task.id} />
            <button type="submit" className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600">
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex gap-3 text-sm text-gray-500">
        <span>Status: {task.status}</span>
        <span>Priority: {task.priority}</span>
        {task.due_date && <span>Due: {task.due_date}</span>}
      </div>
      {task.projects?.name && (
        <p className="mt-2 text-sm text-gray-500">Project: {task.projects.name}</p>
      )}
    </div>
  )
}