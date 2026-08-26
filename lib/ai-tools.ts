import { SupabaseClient } from '@supabase/supabase-js'

export const toolDeclarations = [
  {
    name: 'create_task',
    description: 'Create a new task/to-do item, optionally linked to a project',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        project_name: { type: 'string', description: 'Name of an existing project to link this task to, if mentioned' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        due_date: { type: 'string', description: 'ISO date YYYY-MM-DD, if a deadline was mentioned' },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_task_status',
    description: 'Mark an existing task as done, in progress, or todo, by matching its title',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        task_title: { type: 'string' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
      },
      required: ['task_title', 'status'],
    },
  },
  {
    name: 'delete_task',
    description: 'Permanently delete a task by matching its title. Only use this when the user has clearly and explicitly asked to delete or remove a specific task.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        task_title: { type: 'string' },
      },
      required: ['task_title'],
    },
  },
  {
    name: 'create_project',
    description: 'Create a new project',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['planning', 'active', 'on_hold', 'completed', 'archived'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_project',
    description: "Update an existing project's status, priority, description, or name, by matching its current name",
    parametersJsonSchema: {
      type: 'object',
      properties: {
        project_name: { type: 'string', description: 'Current name of the project to update' },
        new_name: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['planning', 'active', 'on_hold', 'completed', 'archived'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['project_name'],
    },
  },
  {
    name: 'delete_project',
    description: 'Permanently delete a project by matching its name. Only use this when the user has clearly and explicitly asked to delete or remove a specific project. Note this will unlink (not delete) any tasks attached to it.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        project_name: { type: 'string' },
      },
      required: ['project_name'],
    },
  },
  {
    name: 'create_opportunity',
    description: 'Log a new career opportunity: internship, hackathon, competition, etc.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        type: { type: 'string' },
        organization: { type: 'string' },
        deadline: { type: 'string', description: 'ISO date YYYY-MM-DD, if mentioned' },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_opportunity',
    description: "Update an existing opportunity's status, deadline, or details, by matching its title",
    parametersJsonSchema: {
      type: 'object',
      properties: {
        opportunity_title: { type: 'string' },
        status: { type: 'string' },
        deadline: { type: 'string' },
        organization: { type: 'string' },
      },
      required: ['opportunity_title'],
    },
  },
  {
    name: 'delete_opportunity',
    description: 'Permanently delete an opportunity by matching its title. Only use this when the user has clearly and explicitly asked to delete or remove a specific opportunity.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        opportunity_title: { type: 'string' },
      },
      required: ['opportunity_title'],
    },
  },
  {
    name: 'create_skill',
    description: 'Add a new skill the user is tracking',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        category: { type: 'string' },
        proficiency: { type: 'number', description: '1 to 5' },
      },
      required: ['name'],
    },
  },
  {
    name: 'query_data',
    description: "Look up the user's existing projects, tasks, opportunities, or skills to answer questions",
    parametersJsonSchema: {
      type: 'object',
      properties: {
        entity: { type: 'string', enum: ['projects', 'tasks', 'opportunities', 'skills'] },
      },
      required: ['entity'],
    },
  },
]

export async function executeTool(
  supabase: SupabaseClient,
  userId: string,
  toolName: string,
  args: any
): Promise<string> {
  switch (toolName) {
    case 'create_task': {
      let projectId: string | null = null
      if (args.project_name) {
        const { data: proj } = await supabase
          .from('projects')
          .select('id')
          .ilike('name', `%${args.project_name}%`)
          .maybeSingle()
        projectId = proj?.id ?? null
      }

      const { error } = await supabase.from('tasks').insert({
        user_id: userId,
        title: args.title,
        project_id: projectId,
        priority: args.priority ?? 'medium',
        due_date: args.due_date ?? null,
      })
      return error ? `Failed: ${error.message}` : `Created task "${args.title}"`
    }

    case 'update_task_status': {
      const { data: task } = await supabase
        .from('tasks')
        .select('id, title')
        .ilike('title', `%${args.task_title}%`)
        .eq('user_id', userId)
        .maybeSingle()

      if (!task) return `Couldn't find a task matching "${args.task_title}"`

      const { error } = await supabase
        .from('tasks')
        .update({ status: args.status, updated_at: new Date().toISOString() })
        .eq('id', task.id)

      return error ? `Failed: ${error.message}` : `Updated "${task.title}" to ${args.status}`
    }

    case 'delete_task': {
      const { data: task } = await supabase
        .from('tasks')
        .select('id, title')
        .ilike('title', `%${args.task_title}%`)
        .eq('user_id', userId)
        .maybeSingle()

      if (!task) return `Couldn't find a task matching "${args.task_title}" — nothing deleted`

      const { error } = await supabase.from('tasks').delete().eq('id', task.id)
      return error ? `Failed: ${error.message}` : `Deleted task "${task.title}"`
    }

    case 'create_project': {
      const { error } = await supabase.from('projects').insert({
        user_id: userId,
        name: args.name,
        description: args.description ?? null,
        status: args.status ?? 'planning',
        priority: args.priority ?? 'medium',
      })
      return error ? `Failed: ${error.message}` : `Created project "${args.name}"`
    }

    case 'update_project': {
      const { data: proj } = await supabase
        .from('projects')
        .select('id, name')
        .ilike('name', `%${args.project_name}%`)
        .eq('user_id', userId)
        .maybeSingle()

      if (!proj) return `Couldn't find a project matching "${args.project_name}"`

      const updates: any = { updated_at: new Date().toISOString() }
      if (args.new_name) updates.name = args.new_name
      if (args.description) updates.description = args.description
      if (args.status) updates.status = args.status
      if (args.priority) updates.priority = args.priority

      const { error } = await supabase.from('projects').update(updates).eq('id', proj.id)
      return error ? `Failed: ${error.message}` : `Updated project "${proj.name}"`
    }

    case 'delete_project': {
      const { data: proj } = await supabase
        .from('projects')
        .select('id, name')
        .ilike('name', `%${args.project_name}%`)
        .eq('user_id', userId)
        .maybeSingle()

      if (!proj) return `Couldn't find a project matching "${args.project_name}" — nothing deleted`

      const { error } = await supabase.from('projects').delete().eq('id', proj.id)
      return error ? `Failed: ${error.message}` : `Deleted project "${proj.name}"`
    }

    case 'create_opportunity': {
      const { error } = await supabase.from('opportunities').insert({
        user_id: userId,
        title: args.title,
        type: args.type ?? null,
        organization: args.organization ?? null,
        deadline: args.deadline ?? null,
        status: 'saved',
      })
      return error ? `Failed: ${error.message}` : `Logged opportunity "${args.title}"`
    }

    case 'update_opportunity': {
      const { data: opp } = await supabase
        .from('opportunities')
        .select('id, title')
        .ilike('title', `%${args.opportunity_title}%`)
        .eq('user_id', userId)
        .maybeSingle()

      if (!opp) return `Couldn't find an opportunity matching "${args.opportunity_title}"`

      const updates: any = { updated_at: new Date().toISOString() }
      if (args.status) updates.status = args.status
      if (args.deadline) updates.deadline = args.deadline
      if (args.organization) updates.organization = args.organization

      const { error } = await supabase.from('opportunities').update(updates).eq('id', opp.id)
      return error ? `Failed: ${error.message}` : `Updated opportunity "${opp.title}"`
    }

    case 'delete_opportunity': {
      const { data: opp } = await supabase
        .from('opportunities')
        .select('id, title')
        .ilike('title', `%${args.opportunity_title}%`)
        .eq('user_id', userId)
        .maybeSingle()

      if (!opp) return `Couldn't find an opportunity matching "${args.opportunity_title}" — nothing deleted`

      const { error } = await supabase.from('opportunities').delete().eq('id', opp.id)
      return error ? `Failed: ${error.message}` : `Deleted opportunity "${opp.title}"`
    }

    case 'create_skill': {
      const { error } = await supabase.from('skills').insert({
        user_id: userId,
        name: args.name,
        category: args.category ?? null,
        proficiency: args.proficiency ?? 1,
      })
      return error ? `Failed: ${error.message}` : `Added skill "${args.name}"`
    }

    case 'query_data': {
      const { data, error } = await supabase.from(args.entity).select('*').limit(20)
      if (error) return `Failed: ${error.message}`
      return JSON.stringify(data)
    }

    default:
      return `Unknown tool: ${toolName}`
  }
}

// Builds a compact summary of the user's current data, injected into the
// system prompt so the assistant starts every conversation with real context
// instead of blind until it explicitly calls query_data.
export async function getUserContext(supabase: SupabaseClient, userId: string): Promise<string> {
  const [{ data: projects }, { data: tasks }, { data: opportunities }] = await Promise.all([
    supabase.from('projects').select('name, status').eq('status', 'active').limit(10),
    supabase
      .from('tasks')
      .select('title, due_date, priority, status')
      .neq('status', 'done')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(10),
    supabase
      .from('opportunities')
      .select('title, deadline, status')
      .not('deadline', 'is', null)
      .order('deadline', { ascending: true })
      .limit(5),
  ])

  const projectLines = projects?.length
    ? projects.map((p) => `- ${p.name} (${p.status})`).join('\n')
    : 'None'

  const taskLines = tasks?.length
    ? tasks.map((t) => `- ${t.title} [${t.priority}]${t.due_date ? `, due ${t.due_date}` : ''}`).join('\n')
    : 'None'

  const oppLines = opportunities?.length
    ? opportunities.map((o) => `- ${o.title}, deadline ${o.deadline} (${o.status})`).join('\n')
    : 'None'

  return `Active projects:\n${projectLines}\n\nPending tasks:\n${taskLines}\n\nUpcoming opportunity deadlines:\n${oppLines}`
}