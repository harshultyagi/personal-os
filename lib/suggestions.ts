import { SupabaseClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'
import crypto from 'crypto'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// Don't regenerate more than once per this window, even if data changed —
// bounds how many Gemini calls a chatty user/session can trigger.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

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
      .select('title, due_date, status, priority, updated_at')
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

  // Fingerprint the exact data being fed to the model. If this matches the
  // last run and the cache isn't stale, nothing meaningful has changed —
  // skip the Gemini call and serve the cached suggestions.
  const inputHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ tasks, projects }))
    .digest('hex')

  const { data: cached } = await supabase
    .from('suggestion_cache')
    .select('input_hash, generated_at, suggestions')
    .eq('user_id', userId)
    .maybeSingle()

  const cacheIsFresh =
    !!cached && Date.now() - new Date(cached.generated_at).getTime() < CACHE_TTL_MS

  if (cached && cacheIsFresh && cached.input_hash === inputHash) {
    return cached.suggestions as Suggestion[]
  }

  // Compact pipe-delimited rows instead of prose bullet lines — same
  // information, meaningfully fewer input tokens per request.
  const taskLines = tasks?.length
    ? tasks.map((t) => `${t.title}|${t.status}|${t.priority}|${t.due_date ?? '-'}`).join('\n')
    : 'none'

  const projectLines = projects?.length
    ? projects.map((p) => `${p.name}|${p.status}|${p.updated_at.split('T')[0]}`).join('\n')
    : 'none'

  const prompt = `You are a proactive assistant reviewing a student's tasks/projects for 2-4 short, genuinely useful suggestions. Skip generic advice; return fewer or none if nothing's notable.
Today: ${today.toISOString().split('T')[0]}

Tasks (title|status|priority|due_date):
${taskLines}

Active projects (name|status|last_updated):
${projectLines}

Flag: tasks due soon with no progress, vague/bundled task titles, stale projects, overdue items.

Respond with ONLY a JSON array, no other text:
[{"text": "shown to user, under 12 words", "prompt": "first-person message the user would send to act on it"}]`

  let response
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })
  } catch (err) {
    console.error('getSuggestions: Gemini API call failed', err)
    // Prefer stale suggestions over none.
    return cached ? (cached.suggestions as Suggestion[]) : []
  }

  const text = response.text ?? '[]'
  const cleaned = text.replace(/```json|```/g, '').trim()

  let suggestions: Suggestion[]
  try {
    const parsed = JSON.parse(cleaned) as { text: string; prompt: string }[]
    suggestions = parsed.map((s, i) => ({ id: `suggestion-${i}`, text: s.text, prompt: s.prompt }))
  } catch (err) {
    console.error('getSuggestions: failed to parse Gemini response as JSON', err, text)
    return cached ? (cached.suggestions as Suggestion[]) : []
  }

  await supabase.from('suggestion_cache').upsert({
    user_id: userId,
    input_hash: inputHash,
    generated_at: new Date().toISOString(),
    suggestions,
  })

  return suggestions
}