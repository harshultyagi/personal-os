import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/utils/supabase/server'
import { toolDeclarations, executeTool } from '@/lib/ai-tools'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { messages } = await request.json()

  // Convert our simple {role, content}[] into Gemini's expected format
  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const config = {
    tools: [{ functionDeclarations: toolDeclarations }],
    systemInstruction:
      "You are a helpful personal assistant inside the user's productivity app, Personal OS. Be concise. When the user asks you to do something, use the available tools rather than just describing what you'd do.",
  }

  let response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents,
    config,
  })

  const functionCall = response.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)?.functionCall

  if (functionCall) {
    const toolResult = await executeTool(supabase, user.id, functionCall.name!, functionCall.args)

    // Send the tool result back to Gemini so it can produce a natural-language reply
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
  }

  const replyText = response.text ?? "Sorry, I couldn't generate a response."

  return Response.json({ reply: replyText })
}