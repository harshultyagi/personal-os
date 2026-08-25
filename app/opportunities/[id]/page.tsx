import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteOpportunity } from '../actions'

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: opp, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !opp) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{opp.title}</h1>
        <div className="flex gap-2">
          <Link href={`/opportunities/${opp.id}/edit`} className="rounded border px-3 py-1.5 text-sm">
            Edit
          </Link>
          <form action={deleteOpportunity}>
            <input type="hidden" name="id" value={opp.id} />
            <button type="submit" className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600">
              Delete
            </button>
          </form>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600">{opp.organization} — {opp.type}</p>
      <p className="mt-1 text-sm text-gray-600">{opp.location}</p>
      <div className="mt-4 flex gap-3 text-sm text-gray-500">
        <span>Status: {opp.status}</span>
        {opp.deadline && <span>Deadline: {opp.deadline}</span>}
      </div>
      {opp.notes && <p className="mt-4 text-gray-700">{opp.notes}</p>}
    </div>
  )
}