import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function OpportunitiesPage() {
  const supabase = await createClient()
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('deadline', { ascending: true })

  if (error) return <p className="text-red-600">Failed to load: {error.message}</p>

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Opportunities</h1>
        <Link href="/opportunities/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">
          + New Opportunity
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <p className="mt-4 text-gray-500">No opportunities yet.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {opportunities.map((opp) => (
            <Link key={opp.id} href={`/opportunities/${opp.id}`}>
              <div className="rounded border p-4 hover:bg-gray-50">
                <h2 className="font-medium">{opp.title}</h2>
                <p className="text-sm text-gray-600">{opp.organization} — {opp.type}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {opp.status} {opp.deadline && `· due ${opp.deadline}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}