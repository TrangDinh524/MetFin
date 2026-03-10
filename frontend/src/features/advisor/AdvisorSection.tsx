import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2, Sparkles, KeyRound } from 'lucide-react'
import { useFinanceStore } from '../../store/useFinanceStore'
import { api } from '../../lib/api'
import { COLORS } from '../../lib/utils'

const SUGGESTIONS = [
  'How should I allocate a $10K bonus?',
  'Should I pay off credit cards or invest more?',
  'What\'s my biggest financial risk right now?',
  'How can I optimize my bank accounts for better yield?',
  'Am I on track for retirement?',
  'Break down my portfolio strengths and weaknesses.',
]

export function AdvisorSection() {
  const chatMessages = useFinanceStore((s) => s.chatMessages)
  const chatLoading = useFinanceStore((s) => s.chatLoading)
  const sendChatMessage = useFinanceStore((s) => s.sendChatMessage)
  const clearChat = useFinanceStore((s) => s.clearChat)

  const [input, setInput] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.getAdvisorStatus()
      .then((d) => setAvailable(d.available))
      .catch(() => setAvailable(false))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || chatLoading) return
    setInput('')
    sendChatMessage(trimmed)
  }

  const handleSuggestion = (text: string) => {
    if (chatLoading) return
    sendChatMessage(text)
  }

  const isEmpty = chatMessages.length === 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: COLORS.primaryMed }}
            >
              <Bot size={16} style={{ color: COLORS.primaryDark }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0d1117]">
                AI Financial Advisor
              </div>
              <div className="text-[11px] text-[#7a9fad]">
                Powered by your real portfolio data
              </div>
            </div>
          </div>
        </div>
        {chatMessages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg border border-[#cae7ee] bg-[#f0f8fa] px-3 py-1.5 text-[11px] font-medium text-[#3a5260] transition-colors hover:bg-[#e4f2f6]"
          >
            <Trash2 size={12} />
            Clear Chat
          </button>
        )}
      </div>

      {/* API key missing fallback */}
      {available === false && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-[#cae7ee] bg-[#f7fbfc] p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4860a14] border border-[#d4860a20]">
            <KeyRound size={24} className="text-[#d4860a]" />
          </div>
          <div className="text-center">
            <div className="text-[15px] font-semibold text-[#0d1117]">
              API Key Required
            </div>
            <div className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-[#3a5260]">
              To use the AI Advisor, add your OpenAI API key to the{' '}
              <code className="rounded bg-[#f0f8fa] px-1.5 py-0.5 text-[11px] text-[#3d96ad]">.env</code>{' '}
              file in the project root and restart the backend.
            </div>
            <div className="mt-3 rounded-lg bg-[#0d1117] px-4 py-2.5 text-left font-mono text-[11px] text-[#7a9fad]">
              OPENAI_API_KEY=sk-your-key-here
            </div>
          </div>
        </div>
      )}

      {available === null && (
        <div className="flex flex-1 items-center justify-center text-[#7a9fad]">
          Checking AI advisor status…
        </div>
      )}

      {/* Messages area */}
      {available && (<>
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#cae7ee] bg-[#f7fbfc] p-4">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: COLORS.primaryMed }}
              >
                <Sparkles size={24} style={{ color: COLORS.primaryDark }} />
              </div>
              <div className="text-center">
                <div className="text-[15px] font-semibold text-[#0d1117]">
                  Ask me anything about your finances
                </div>
                <div className="mt-1 text-[12px] text-[#7a9fad]">
                  I have full access to your portfolio, banking, crypto, and debt data.
                </div>
              </div>
            </div>
            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  className="rounded-xl border border-[#cae7ee] bg-white px-3.5 py-2.5 text-left text-[12px] text-[#3a5260] transition-all hover:border-[#a8d8e4] hover:bg-[#f0f8fa] hover:shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-[#55b2c9]'
                      : 'border border-[#cae7ee] bg-white'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User size={14} className="text-white" />
                  ) : (
                    <Bot size={14} style={{ color: COLORS.primaryDark }} />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#55b2c9] text-white'
                      : 'border border-[#cae7ee] bg-white text-[#0d1117]'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownContent content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#cae7ee] bg-white">
                  <Bot size={14} style={{ color: COLORS.primaryDark }} />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-[#cae7ee] bg-white px-4 py-3">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#7a9fad] [animation-delay:0ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#7a9fad] [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#7a9fad] [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your finances..."
          disabled={chatLoading}
          className="flex-1 rounded-xl border border-[#cae7ee] bg-white px-4 py-3 text-[13px] text-[#0d1117] placeholder-[#7a9fad] outline-none transition-colors focus:border-[#55b2c9] focus:ring-1 focus:ring-[#55b2c9]/30 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || chatLoading}
          className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl bg-[#55b2c9] text-white transition-all hover:bg-[#3d96ad] disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
      </>)}
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />

        let processed = line
        processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>')
        processed = processed.replace(/`(.+?)`/g, '<code class="rounded bg-[#f0f8fa] px-1 py-0.5 text-[12px] text-[#3d96ad]">$1</code>')

        if (line.startsWith('### ')) {
          return <div key={i} className="mt-2 text-[13px] font-bold text-[#0d1117]" dangerouslySetInnerHTML={{ __html: processed.slice(4) }} />
        }
        if (line.startsWith('## ')) {
          return <div key={i} className="mt-2 text-[14px] font-bold text-[#0d1117]" dangerouslySetInnerHTML={{ __html: processed.slice(3) }} />
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#55b2c9]" />
              <span dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
            </div>
          )
        }
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\.\s/)?.[1]
          const rest = line.replace(/^\d+\.\s/, '')
          let restProcessed = rest
          restProcessed = restProcessed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          restProcessed = restProcessed.replace(/\*(.+?)\*/g, '<em>$1</em>')
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="flex-shrink-0 font-semibold text-[#55b2c9]">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: restProcessed }} />
            </div>
          )
        }

        return <div key={i} dangerouslySetInnerHTML={{ __html: processed }} />
      })}
    </div>
  )
}
