'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSkill(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('skills').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    proficiency: Number(formData.get('proficiency')),
  })

  if (error) redirect('/skills/new?error=' + encodeURIComponent(error.message))

  revalidatePath('/skills')
  redirect('/skills')
}

export async function updateSkill(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('skills')
    .update({
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      proficiency: Number(formData.get('proficiency')),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/skills')
  revalidatePath(`/skills/${id}`)
  redirect(`/skills/${id}`)
}

export async function deleteSkill(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('skills').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/skills')
  redirect('/skills')
}