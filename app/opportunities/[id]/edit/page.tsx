import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { updateOpportunity } from '../../actions'

export default async function EditOpportunityPage({
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
      <h1 className="text-2xl font-semibold">Edit Opportunity</h1>

      <form action={updateOpportunity} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={opp.id} />
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" defaultValue={opp.title} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Type</label>
          <input name="type" defaultValue={opp.type} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Organization</label>
          <input name="organization" defaultValue={opp.organization} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input name="location" defaultValue={opp.location} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <input name="status" defaultValue={opp.status} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Deadline</label>
          <input type="date" name="deadline" defaultValue={opp.deadline ?? ''} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea name="notes" defaultValue={opp.notes} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Save Changes
        </button>
      </form>
    </div>
  )
}