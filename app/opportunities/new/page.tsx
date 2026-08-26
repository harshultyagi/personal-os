import { createOpportunity } from '../actions'

export default async function NewOpportunityPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    title?: string
    type?: string
    organization?: string
    deadline?: string
    summary?: string
    gmail_link?: string
  }>
}) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">New Opportunity</h1>

      {params.error && (
        <p className="mt-4 rounded bg-red-50 p-2 text-sm text-red-600">{params.error}</p>
      )}

      {params.summary && (
        <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-900">From your email:</p>
          <p className="mt-1 text-sm text-gray-700">{params.summary}</p>
          {params.gmail_link && (
            <a
              href={params.gmail_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-blue-600 underline"
            >
              View original email →
            </a>
          )}
        </div>
      )}

      <form action={createOpportunity} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" defaultValue={params.title ?? ''} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Type</label>
          <input
            name="type"
            defaultValue={params.type ?? ''}
            placeholder="internship / hackathon / competition"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Organization</label>
          <input name="organization" defaultValue={params.organization ?? ''} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input name="location" className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <input name="status" defaultValue="saved" className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Deadline</label>
          <input type="date" name="deadline" defaultValue={params.deadline ?? ''} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea name="notes" className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Create Opportunity
        </button>
      </form>
    </div>
  )
}