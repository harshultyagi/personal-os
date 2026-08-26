import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'

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

  // Whenever googleapis silently refreshes the access token, persist it
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
export async function fetchRecentEmails(userId: string) {
  const gmail = await getGmailClient(userId)

  const { data: list } = await gmail.users.messages.list({
    userId: 'me',
    q: 'newer_than:1d', // Gmail's own search syntax — mirrors what you'd type in the Gmail search bar
    maxResults: 20,
  })

  if (!list.messages) return []

  const emails = await Promise.all(
    list.messages.map(async (msg) => {
      const { data: full } = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From'],
      })

      const headers = full.payload?.headers ?? []
      const subject = headers.find((h) => h.name === 'Subject')?.value ?? '(no subject)'
      const from = headers.find((h) => h.name === 'From')?.value ?? '(unknown sender)'

      return { id: msg.id!, subject, from, snippet: full.snippet ?? '' }
    })
  )

  return emails
}

import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export type ClassifiedEmail = {
  id: string
  subject: string
  from: string
  relevant: boolean
  category: 'opportunity' | 'deadline' | 'academic' | 'noise'
  reason: string
}

export async function classifyEmails(emails: { id: string; subject: string; from: string; snippet: string }[]) {
  if (emails.length === 0) return []

  const prompt = `You are helping a student sort their email into what's actually useful for their career/academic tracking vs noise.

For each email below, classify it as one of: "opportunity" (internships, hackathons, competitions, job-related), "deadline" (something time-sensitive they need to act on), "academic" (coursework/university admin — relevant but not urgent), or "noise" (irrelevant, promotional, automated confirmations with no action needed).

Only mark "relevant": true for opportunity or deadline categories — things genuinely worth surfacing.

Emails:
${emails.map((e, i) => `${i + 1}. ID: ${e.id}\nSubject: ${e.subject}\nFrom: ${e.from}\nSnippet: ${e.snippet}`).join('\n\n')}

Respond with ONLY a JSON array, no other text, in this exact shape:
[{"id": "...", "subject": "...", "from": "...", "relevant": true/false, "category": "...", "reason": "one short sentence"}]`

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = response.text ?? '[]'
  const cleaned = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned) as ClassifiedEmail[]
  } catch {
    return []
  }
}

export async function getOrCreateBriefing(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data: existing } = await supabase
    .from('daily_briefings')
    .select('*')
    .eq('user_id', userId)
    .eq('briefing_date', today)
    .maybeSingle()

  if (existing) return existing.items as ClassifiedEmail[]

  const { data: tokenRow } = await supabase
    .from('google_tokens')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!tokenRow) return null // Gmail not connected — nothing to brief

  const emails = await fetchRecentEmails(userId)
  const classified = await classifyEmails(emails)
  const relevant = classified.filter((e) => e.relevant)

  await supabase.from('daily_briefings').insert({
    user_id: userId,
    briefing_date: today,
    items: relevant,
  })

  return relevant
}