import { createClient } from '@/utils/supabase/server'
import { fetchRecentEmails, classifyEmails } from '@/lib/google'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'not logged in' }, { status: 401 })

  const emails = await fetchRecentEmails(user.id)
  const classified = await classifyEmails(emails)
  return Response.json({ classified })
}