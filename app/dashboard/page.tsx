import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getOrCreateBriefing } from '@/lib/google'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  const briefing = user ? await getOrCreateBriefing(user.id) : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <a
        href="/api/auth/google/start"
        className="mt-2 inline-block rounded border px-3 py-1.5 text-sm"
      >
        Connect Gmail
      </a>

      {briefing && briefing.length > 0 && (
        <div className="mt-6 rounded border border-blue-200 bg-blue-50 p-4">
          <h2 className="font-medium text-gray-800">Today's Briefing</h2>
          <div className="mt-2 space-y-2">
            {briefing.map((item) => {
              const isTask = item.category === 'task'
              const isOpportunity = item.category === 'opportunity'
              const gmailLink = `https://mail.google.com/mail/u/0/#all/${item.id}`

              const taskHref = `/tasks/new?title=${encodeURIComponent(
                item.task_title ?? item.subject
              )}&due_date=${encodeURIComponent(item.due_date ?? '')}&priority=${encodeURIComponent(
                item.priority ?? 'medium'
              )}&summary=${encodeURIComponent(item.summary ?? '')}&gmail_link=${encodeURIComponent(gmailLink)}`

              const oppHref = `/opportunities/new?title=${encodeURIComponent(
                item.opp_title ?? item.subject
              )}&type=${encodeURIComponent(item.opp_type ?? '')}&organization=${encodeURIComponent(
                item.organization ?? ''
              )}&deadline=${encodeURIComponent(item.deadline ?? '')}&summary=${encodeURIComponent(
                item.summary ?? ''
              )}&gmail_link=${encodeURIComponent(gmailLink)}`

              return (
                <div key={item.id} className="rounded border bg-white p-3">
                  <p className="text-sm font-medium">{item.subject}</p>
                  <p className="text-xs text-gray-500">{item.category} · {item.reason}</p>
                  <div className="mt-2 flex gap-2">
                    {isTask && (
                      <Link
                        href={taskHref}
                        className="inline-block rounded bg-black px-2.5 py-1 text-xs text-white"
                      >
                        + Add as Task
                      </Link>
                    )}
                    {isOpportunity && (
                      <Link
                        href={oppHref}
                        className="inline-block rounded bg-black px-2.5 py-1 text-xs text-white"
                      >
                        + Add as Opportunity
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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