'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('opportunities').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    type: formData.get('type') as string,
    organization: formData.get('organization') as string,
    location: formData.get('location') as string,
    status: formData.get('status') as string,
    deadline: formData.get('deadline') || null,
    notes: formData.get('notes') as string,
  })

  if (error) redirect('/opportunities/new?error=' + encodeURIComponent(error.message))

  revalidatePath('/opportunities')
  redirect('/opportunities')
}

export async function updateOpportunity(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('opportunities')
    .update({
      title: formData.get('title') as string,
      type: formData.get('type') as string,
      organization: formData.get('organization') as string,
      location: formData.get('location') as string,
      status: formData.get('status') as string,
      deadline: formData.get('deadline') || null,
      notes: formData.get('notes') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/opportunities')
  revalidatePath(`/opportunities/${id}`)
  redirect(`/opportunities/${id}`)
}

export async function deleteOpportunity(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('opportunities').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/opportunities')
  redirect('/opportunities')
}