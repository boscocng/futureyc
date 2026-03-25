import { useState, useEffect, useRef } from 'react'

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ role, content, timestamp }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 ${
          isUser
            ? 'bg-[#2A5FE6] text-white rounded-2xl rounded-br-[4px]'
            : 'bg-white text-[#1A1A1A] border border-[#E5E5E5] rounded-2xl rounded-bl-[4px]'
        }`}
        style={{ boxShadow: isUser ? 'none' : '0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        {timestamp && (
          <p className={`text-xs mt-1.5 ${isUser ? 'text-blue-200' : 'text-[#9B9B9B]'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="bg-white border border-[#E5E5E5] rounded-2xl rounded-bl-[4px] px-4 py-3"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 bg-[#D4D4D4] rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-[#D4D4D4] rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-[#D4D4D4] rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

export default function ChatPanel({
  messages,
  onSend,
  sending = false,
  disabled = false,
  placeholder = 'Type your message...',
  className = '',
}) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  useEffect(() => {
    if (!sending) inputRef.current?.focus()
  }, [sending])

  function handleSubmit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || disabled) return
    setInput('')
    onSend(text)
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 bg-[#F7F7F5]">
        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} />
        ))}
        {sending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!disabled && (
        <div className="border-t border-[#E5E5E5] bg-white px-4 py-3 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sending ? 'Waiting for response...' : placeholder}
              disabled={sending}
              className="flex-1 bg-white border border-[#D4D4D4] rounded-lg px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#9B9B9B] focus:outline-none focus:border-[#2A5FE6] focus:ring-1 focus:ring-[#2A5FE6]/20 transition-colors duration-150 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer flex-shrink-0
                ${
                  input.trim() && !sending
                    ? 'bg-[#2A5FE6] hover:bg-[#1E4FCC] text-white'
                    : 'bg-[#F5F5F5] text-[#9B9B9B] cursor-not-allowed'
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.27 3.126A59.77 59.77 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export { formatTime }
