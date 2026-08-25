import { createSkill } from '../actions'

export default async function NewSkillPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">New Skill</h1>

      {params.error && (
        <p className="mt-4 rounded bg-red-50 p-2 text-sm text-red-600">{params.error}</p>
      )}

      <form action={createSkill} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input name="category" placeholder="e.g. Language, Framework, Tool" className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Proficiency (1–5)</label>
          <input type="number" name="proficiency" min="1" max="5" defaultValue="1" required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Add Skill
        </button>
      </form>
    </div>
  )
}