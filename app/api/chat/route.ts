import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/utils/supabase/server'
import { toolDeclarations, executeTool, getUserContext } from '@/lib/ai-tools'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const MAX_TOOL_ITERATIONS = 5

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { messages } = await request.json()

  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const userContext = await getUserContext(supabase, user.id)

  const config = {
    tools: [{ functionDeclarations: toolDeclarations }],
    systemInstruction: `You are the personal assistant inside Personal OS, a productivity app for a student managing their projects, tasks, opportunities, and skills.

Personality: be direct, concise, and genuinely helpful — like a sharp assistant who respects the user's time. No filler, no over-explaining. A sentence or two is usually enough.

Current state of the user's data:
${userContext}

Guidelines:
- Use this context to answer questions naturally, without needing to call query_data for things already listed above. Only call query_data when you need something not shown here, or more detail.
- If a request is ambiguous (e.g. unclear which project, vague date like "soon"), ask a brief clarifying question rather than guessing.
- For delete actions specifically: only delete when the user has clearly and explicitly asked to remove something. If unsure whether they mean delete vs. something else, ask first.
- You can chain multiple tool calls in one response if a request genuinely requires it (e.g. "find my overdue tasks and mark the oldest one done").
- After taking an action, confirm briefly what you did — don't just say "done," name the specific thing.
- If something fails, say so plainly and suggest what to try instead.`,
  }

  let iterations = 0
  let response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents,
    config,
  })

  while (iterations < MAX_TOOL_ITERATIONS) {
    const functionCall = response.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)?.functionCall

    if (!functionCall) break

    const toolResult = await executeTool(supabase, user.id, functionCall.name!, functionCall.args)

    contents.push(response.candidates![0].content!)
    contents.push({
      role: 'user',
      parts: [{ functionResponse: { name: functionCall.name!, response: { result: toolResult } } }],
    })

    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config,
    })

    iterations++
  }

  const replyText = response.text ?? "Sorry, I couldn't generate a response."

  return Response.json({ reply: replyText })
}