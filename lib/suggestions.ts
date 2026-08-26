import { SupabaseClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export type Suggestion = {
  id: string
  text: string
  prompt: string
}

export async function getSuggestions(supabase: SupabaseClient, userId: string): Promise<Suggestion[]> {
  const today = new Date()

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase
      .from('tasks')
      .select('title, due_date, status, priority, created_at')
      .neq('status', 'done')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(15),
    supabase
      .from('projects')
      .select('name, status, updated_at')
      .eq('status', 'active')
      .limit(10),
  ])

  if ((!tasks || tasks.length === 0) && (!projects || projects.length === 0)) {
    return []
  }

  const taskLines = tasks?.length
    ? tasks
        .map(
          (t) =>
            `- ${t.title} [${t.status}, ${t.priority}]${t.due_date ? `, due ${t.due_date}` : ', no due date'}, created ${t.created_at}`
        )
        .join('\n')
    : 'None'

  const projectLines = projects?.length
    ? projects.map((p) => `- ${p.name}, last updated ${p.updated_at}`).join('\n')
    : 'None'

  const prompt = `You are a proactive personal assistant reviewing a student's current tasks and projects to surface a few short, genuinely useful suggestions — not generic advice.

Today's date: ${today.toISOString().split('T')[0]}

Tasks:
${taskLines}

Active projects:
${projectLines}

Look for things like: tasks due soon with no clear progress, tasks that look like they're actually multiple steps bundled into one (vague or broad titles), projects that haven't been touched in a while, or overdue items.

Generate 2-4 short suggestions, each as a natural chat message the user could send to their assistant to act on it. Only generate suggestions genuinely worth surfacing — if there's nothing notable, return fewer or none.

Respond with ONLY a JSON array, no other text, in this shape:
[{"text": "short suggestion shown to the user, under 12 words", "prompt": "the actual message the user would send if they click this, phrased naturally in first person"}]`

  let response
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })
  } catch (err) {
    // Quota exceeded (429), model overloaded (503), etc. — suggestions are
    // a nice-to-have, so fail soft instead of taking down the layout.
    console.error('getSuggestions: Gemini API call failed', err)
    return []
  }

  const text = response.text ?? '[]'
  const cleaned = text.replace(/```json|```/g, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as { text: string; prompt: string }[]
    return parsed.map((s, i) => ({ id: `suggestion-${i}`, text: s.text, prompt: s.prompt }))
  } catch {
    return []
  }
}