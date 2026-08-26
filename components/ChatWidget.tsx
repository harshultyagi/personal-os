'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }
type Suggestion = { id: string; text: string; prompt: string }

export default function ChatWidget({ initialSuggestions }: { initialSuggestions: Suggestion[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(overrideText?: string) {
    const text = overrideText ?? input
    if (!text.trim() || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()

      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: `Error: ${data.error}` }])
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleSuggestionClick(s: Suggestion) {
    setIsOpen(true)
    setInput(s.prompt)
  }

  function dismissSuggestion(id: string) {
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <>
      {/* Suggestion pills — hidden while the chat panel is open */}
      {!isOpen && suggestions.length > 0 && (
        <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-2 sm:right-6">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="flex max-w-[240px] items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs shadow-md sm:max-w-xs"
            >
              <button
                onClick={() => handleSuggestionClick(s)}
                className="text-left text-gray-800 hover:text-black"
              >
                {s.text}
              </button>
              <button
                onClick={() => dismissSuggestion(s.id)}
                aria-label="Dismiss suggestion"
                className="shrink-0 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 sm:bottom-6 sm:right-6"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 z-50 flex h-[70vh] max-h-[500px] flex-col rounded-lg border bg-white shadow-xl sm:inset-x-auto sm:right-6 sm:w-96">
          <div className="border-b p-3 font-medium">Assistant</div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400">
                Try: "Add a task to finish the README by Friday"
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'ml-auto max-w-[80%] bg-black text-white'
                    : 'mr-auto max-w-[80%] bg-gray-100 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="mr-auto text-sm text-gray-400">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask or tell me to do something..."
              className="flex-1 rounded border px-3 py-1.5 text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}