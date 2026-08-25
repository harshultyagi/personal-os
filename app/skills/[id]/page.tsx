import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteSkill } from '../actions'

export default async function SkillDetailPage({
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{skill.name}</h1>
        <div className="flex gap-2">
          <Link href={`/skills/${skill.id}/edit`} className="rounded border px-3 py-1.5 text-sm">
            Edit
          </Link>
          <form action={deleteSkill}>
            <input type="hidden" name="id" value={skill.id} />
            <button type="submit" className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600">
              Delete
            </button>
          </form>
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-500">{skill.category}</p>
      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`h-3 w-3 rounded-full ${
              n <= skill.proficiency ? 'bg-black' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}