'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projectId = formData.get('project_id') as string

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    project_id: projectId || null,
    title: formData.get('title') as string,
    status: formData.get('status') as string,
    priority: formData.get('priority') as string,
    due_date: formData.get('due_date') || null,
  })

  if (error) redirect('/tasks/new?error=' + encodeURIComponent(error.message))

  revalidatePath('/tasks')
  redirect('/tasks')
}

export async function updateTask(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const projectId = formData.get('project_id') as string

  const { error } = await supabase
    .from('tasks')
    .update({
      project_id: projectId || null,
      title: formData.get('title') as string,
      status: formData.get('status') as string,
      priority: formData.get('priority') as string,
      due_date: formData.get('due_date') || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)
  redirect(`/tasks/${id}`)
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/tasks')
  redirect('/tasks')
}

// Quick toggle used directly from the list view
export async function toggleTaskStatus(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const currentStatus = formData.get('currentStatus') as string

  const newStatus = currentStatus === 'done' ? 'todo' : 'done'

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/tasks')
}