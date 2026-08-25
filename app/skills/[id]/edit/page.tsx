import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { updateSkill } from '../../actions'

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: skill, error } = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !skill) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold">Edit Skill</h1>

      <form action={updateSkill} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={skill.id} />
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" defaultValue={skill.name} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input name="category" defaultValue={skill.category} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Proficiency (1–5)</label>
          <input type="number" name="proficiency" min="1" max="5" defaultValue={skill.proficiency} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Save Changes
        </button>
      </form>
    </div>
  )
}