import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function getGmailClient(userId: string) {
  const supabase = await createClient()

  const { data: tokenRow, error } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !tokenRow) {
    throw new Error('Gmail not connected for this user')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/google/callback'
  )

  oauth2Client.setCredentials({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token,
    expiry_date: tokenRow.expiry_date,
  })

  oauth2Client.on('tokens', async (newTokens) => {
    if (newTokens.access_token) {
      await supabase
        .from('google_tokens')
        .update({
          access_token: newTokens.access_token,
          expiry_date: newTokens.expiry_date,
        })
        .eq('user_id', userId)
    }
  })

  return google.gmail({ version: 'v1', auth: oauth2Client })
}

function extractPlainText(payload: any): string {
  if (!payload) return ''

  function decode(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8')
  }

  function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  if (payload.body?.data) {
    const text = decode(payload.body.data)
    return payload.mimeType === 'text/html' ? stripHtml(text) : text
  }

  if (payload.parts) {
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain')
    if (plainPart?.body?.data) return decode(plainPart.body.data)

    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html')
    if (htmlPart?.body?.data) return stripHtml(decode(htmlPart.body.data))

    for (const part of payload.parts) {
      const nested = extractPlainText(part)
      if (nested) return nested
    }
  }

  return ''
}

// query lets callers pass a custom Gmail search (e.g. "after:<epoch>")
// instead of always defaulting to the last 24 hours
export async function fetchEmails(userId: string, query: string) {
  const gmail = await getGmailClient(userId)

  const { data: list } = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 20,
  })

  if (!list.messages) return []

  const emails = await Promise.all(
    list.messages.map(async (msg) => {
      const { data: full } = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      })

      const headers = full.payload?.headers ?? []
      const subject = headers.find((h) => h.name === 'Subject')?.value ?? '(no subject)'
      const from = headers.find((h) => h.name === 'From')?.value ?? '(unknown sender)'

      const bodyText = extractPlainText(full.payload)
      const truncatedBody = bodyText.slice(0, 2000)

      return { id: msg.id!, subject, from, snippet: full.snippet ?? '', body: truncatedBody }
    })
  )

  return emails
}

export type ClassifiedEmail = {
  id: string
  subject: string
  from: string
  relevant: boolean
  category: 'task' | 'opportunity' | 'academic' | 'noise'
  reason: string
  summary?: string
  task_title?: string
  due_date?: string | null
  priority?: 'low' | 'medium' | 'high'
  opp_title?: string
  opp_type?: string
  organization?: string
  deadline?: string | null
}

export async function classifyEmails(
  emails: { id: string; subject: string; from: string; snippet: string; body: string }[]
) {
  if (emails.length === 0) return []

  const today = new Date().toISOString().split('T')[0]

  const prompt = `You are helping a student sort their email into what's actually useful for their career/academic tracking vs noise.

Today's date is ${today}.

IMPORTANT — Deduplication: if multiple emails clearly refer to the same underlying event or deadline (e.g. an original announcement and a later reminder about it), treat them as ONE item, not separate items. Use the most complete and most recent information across them, and only include the item once in your output. Do not output near-duplicate items.

For each remaining unique item, classify it as one of:
- "task": something with a specific deadline the student must personally do — quizzes, exams, assignment due dates, form submissions.
- "opportunity": something to apply to or attend — hackathons, competitions, internships, cultural/tech events, workshops, guest lectures, seminars.
- "academic": relevant university admin/announcements but no personal action needed.
- "noise": irrelevant, promotional, or automated with no action needed.

Only mark "relevant": true for "task" or "opportunity".

For every relevant item, also write:
- summary: a genuine TL;DR (2-4 sentences) of the full email content — include specific dates, times, locations, links, or requirements mentioned in the body. This should give the student everything they need to know without opening the email.

For "task" items, also extract:
- task_title: a short, clean task name (not the raw email subject)
- due_date: an ISO date YYYY-MM-DD if a specific date/time is mentioned, else null
- priority: "low", "medium", or "high" based on urgency

For "opportunity" items, also extract:
- opp_title: a short, clean name for the opportunity
- opp_type: one of "hackathon", "competition", "internship", "event", "workshop", "guest lecture", or your best short label
- organization: the hosting organization/company if mentioned, else null
- deadline: an ISO date YYYY-MM-DD if an application/event deadline is mentioned, else null

Emails (each includes full body content):
${emails
  .map(
    (e, i) =>
      `${i + 1}. ID: ${e.id}\nSubject: ${e.subject}\nFrom: ${e.from}\nBody: ${e.body}`
  )
  .join('\n\n')}

Respond with ONLY a JSON array, no other text, in this exact shape:
[{
  "id": "..." (use the ID of the most recent/complete email if merging duplicates),
  "subject": "...", "from": "...", "relevant": true/false, "category": "...", "reason": "one short sentence",
  "summary": "..." (only if relevant),
  "task_title": "..." (only if category is task),
  "due_date": "YYYY-MM-DD" or null (only if category is task),
  "priority": "..." (only if category is task),
  "opp_title": "..." (only if category is opportunity),
  "opp_type": "..." (only if category is opportunity),
  "organization": "..." or null (only if category is opportunity),
  "deadline": "YYYY-MM-DD" or null (only if category is opportunity)
}]`

  let response
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })
  } catch (err) {
    // Quota exceeded (429), model overloaded (503), etc. — treat as "nothing
    // classified this run" rather than crashing whatever called us.
    console.error('classifyEmails: Gemini API call failed', err)
    return []
  }

  const text = response.text ?? '[]'
  const cleaned = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned) as ClassifiedEmail[]
  } catch (err) {
    console.error('classifyEmails: failed to parse Gemini response as JSON', err, text)
    return []
  }
}

function getTodayIST() {
  const now = new Date()
  return now.toLocaleString('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function getCurrentSlot(): 'morning' | 'evening' {
  const hourIST = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false,
    }).format(new Date())
  )
  return hourIST < 12 ? 'morning' : 'evening'
}

export async function getOrCreateBriefing(userId: string) {
  try {
    return await buildBriefing(userId)
  } catch (err) {
    // Gmail token issues, Gemini quota/overload, Supabase hiccups, etc. —
    // the briefing is a bonus widget, not something that should 500 the
    // whole dashboard.
    console.error('getOrCreateBriefing: failed to build briefing', err)
    return null
  }
}

async function buildBriefing(userId: string) {
  const supabase = await createClient()
  const today = getTodayIST()
  const currentSlot = getCurrentSlot()

  const { data: tokenRow } = await supabase
    .from('google_tokens')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!tokenRow) return null

  // Fetch whatever slots already exist for today
  const { data: existingRows } = await supabase
    .from('daily_briefings')
    .select('*')
    .eq('user_id', userId)
    .eq('briefing_date', today)

  const morningRow = existingRows?.find((r) => r.slot === 'morning')
  const eveningRow = existingRows?.find((r) => r.slot === 'evening')

  // If the current slot already has a row, we're done for now —
  // just show whatever slots exist so far, combined
  const currentSlotRow = currentSlot === 'morning' ? morningRow : eveningRow
  if (currentSlotRow) {
    const combined = [...(morningRow?.items ?? []), ...(eveningRow?.items ?? [])]
    return combined as ClassifiedEmail[]
  }

  // Need to generate the current slot
  let query: string
  if (currentSlot === 'morning') {
    query = 'newer_than:1d'
  } else {
    // Evening slot: only scan email that arrived since the morning scan ran,
    // so we don't re-classify (and potentially re-show) the same emails
    const sinceEpoch = morningRow
      ? Math.floor(new Date(morningRow.created_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - 24 * 60 * 60
    query = `after:${sinceEpoch}`
  }

  const emails = await fetchEmails(userId, query)
  const classified = await classifyEmails(emails)
  const relevant = classified.filter((e) => e.relevant)

  await supabase.from('daily_briefings').insert({
    user_id: userId,
    briefing_date: today,
    slot: currentSlot,
    items: relevant,
  })

  const combined = currentSlot === 'morning'
    ? relevant
    : [...(morningRow?.items ?? []), ...relevant]

  return combined as ClassifiedEmail[]
}