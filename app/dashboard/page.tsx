import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: activeProjects },
    { count: pendingTasks },
    { data: upcomingTasks },
    { data: upcomingOpportunities },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'done'),
    supabase
      .from('tasks')
      .select('id, title, due_date, projects(name)')
      .neq('status', 'done')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
      .limit(5)
      .returns<{ id: string; title: string; due_date: string | null; projects: { name: string } | null }[]>(),
    supabase
      .from('opportunities')
      .select('id, title, deadline')
      .not('deadline', 'is', null)
      .order('deadline', { ascending: true })
      .limit(5),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="mt-1 text-3xl font-semibold">{activeProjects ?? 0}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Pending Tasks</p>
          <p className="mt-1 text-3xl font-semibold">{pendingTasks ?? 0}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-medium text-gray-700">Upcoming Task Deadlines</h2>
          {!upcomingTasks || upcomingTasks.length === 0 ? (
            <p className="mt-2 text-sm text-gray-400">Nothing due soon.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {upcomingTasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="rounded border p-3 hover:bg-gray-50">
                    <p className="text-sm">{task.title}</p>
                    <p className="text-xs text-gray-400">
                      {task.projects?.name && `${task.projects.name} · `}
                      due {task.due_date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-medium text-gray-700">Upcoming Opportunity Deadlines</h2>
          {!upcomingOpportunities || upcomingOpportunities.length === 0 ? (
            <p className="mt-2 text-sm text-gray-400">Nothing due soon.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {upcomingOpportunities.map((opp) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                  <div className="rounded border p-3 hover:bg-gray-50">
                    <p className="text-sm">{opp.title}</p>
                    <p className="text-xs text-gray-400">due {opp.deadline}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}