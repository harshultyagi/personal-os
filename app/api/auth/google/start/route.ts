import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/google/callback'
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // required to get a refresh token, not just a short-lived access token
    prompt: 'consent',      // forces Google to always issue a refresh token, even on repeat connects
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
  })

  redirect(authUrl)
}