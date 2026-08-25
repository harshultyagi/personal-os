import { SupabaseClient } from '@supabase/supabase-js'

// Tool definitions — this is what we tell Gemini it's allowed to do
export const toolDeclarations = [
  {
    name: 'create_task',
    description: 'Create a new task/to-do item, optionally linked to a project',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The task title' },
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
        task_title: { type: 'string', description: 'Title or partial title of the task to update' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
      },
      required: ['task_title', 'status'],
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
    name: 'create_opportunity',
    description: 'Log a new career opportunity: internship, hackathon, competition, etc.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        type: { type: 'string', description: 'e.g. internship, hackathon, competition' },
        organization: { type: 'string' },
        deadline: { type: 'string', description: 'ISO date YYYY-MM-DD, if mentioned' },
      },
      required: ['title'],
    },
  },
  {
    name: 'query_data',
    description: "Look up the user's existing projects, tasks, or opportunities to answer questions",
    parametersJsonSchema: {
      type: 'object',
      properties: {
        entity: { type: 'string', enum: ['projects', 'tasks', 'opportunities', 'skills'] },
      },
      required: ['entity'],
    },
  },
]

// Executes a tool call against Supabase, scoped to the authenticated user
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

    case 'query_data': {
      const { data, error } = await supabase.from(args.entity).select('*').limit(20)
      if (error) return `Failed: ${error.message}`
      return JSON.stringify(data)
    }

    default:
      return `Unknown tool: ${toolName}`
  }
}