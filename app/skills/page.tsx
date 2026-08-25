import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function SkillsPage() {
  const supabase = await createClient()
  const { data: skills, error } = await supabase
    .from('skills')
    .select('*')
    .order('name', { ascending: true })

  if (error) return <p className="text-red-600">Failed to load: {error.message}</p>

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Skills</h1>
        <Link href="/skills/new" className="rounded bg-black px-3 py-1.5 text-sm text-white">
          + New Skill
        </Link>
      </div>

      {skills.length === 0 ? (
        <p className="mt-4 text-gray-500">No skills tracked yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`}>
              <div className="rounded border p-4 hover:bg-gray-50">
                <h2 className="font-medium">{skill.name}</h2>
                <p className="text-sm text-gray-500">{skill.category}</p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-2 w-2 rounded-full ${
                        n <= skill.proficiency ? 'bg-black' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}