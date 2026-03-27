import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Tokens ────────────────────────────────────────────────────
const BG   = '#EEEAE3'
const TEXT = '#1C1917'
const UI   = "'Plus Jakarta Sans', system-ui, sans-serif"

// ─── Phases ────────────────────────────────────────────────────
const PHASES = ['Your idea', 'The scope', 'Almost done']

// ─── Mock script ───────────────────────────────────────────────
// Each entry is the AI response that follows a user message.
// SCRIPT[0] is auto-shown on mount (no preceding user message).
// phaseTransition: applied immediately when this response is triggered.
const SCRIPT = [
  {
    text: "Alright — tell me about your project. What are you trying to build? Don't worry about being precise, just describe it like you'd explain it to a friend.",
    chips: [],
    typingMs: 0,
    phaseTransition: null,
    isLast: false,
  },
  {
    text: "Love it. Who's this actually for — yourself, or are you thinking about other people using it too?",
    chips: ['Just me', 'Other people', 'Not sure yet'],
    typingMs: 1200,
    phaseTransition: null,
    isLast: false,
  },
  {
    text: "Got it. If this only did one thing when we're done — what would that be? The one feature you'd be disappointed without.",
    chips: ['Logging workouts', 'Seeing progress charts', 'Something else'],
    typingMs: 800,
    phaseTransition: 1,
    isLast: false,
  },
  {
    text: "Perfect. Have you seen anything that does something similar? An app, a website — even if it's only kind of related.",
    chips: [],
    typingMs: 1000,
    phaseTransition: null,
    isLast: false,
  },
  {
    text: "Last one — are you building this to actually use it, as a portfolio piece, or to learn how this works?",
    chips: ['To actually use it', 'Portfolio', 'To learn'],
    typingMs: 800,
    phaseTransition: 2,
    isLast: false,
  },
  {
    text: "That's everything I need. Building your project brain now.",
    chips: [],
    typingMs: 600,
    phaseTransition: null,
    isLast: true,
  },
]

// ─── Global CSS ─────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=DM+Mono&display=swap');

  @keyframes im-fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes im-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes im-chipIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes im-dot {
    0%, 100% { opacity: 0.25; }
    50%       { opacity: 0.8;  }
  }
  @keyframes bw-float {
    from { transform: translateY(0); }
    to   { transform: translateY(-110vh); }
  }
  @keyframes bw-arc {
    from { stroke-dashoffset: 201; }
    to   { stroke-dashoffset: 0; }
  }

  .im-chip:hover {
    background: rgba(255,255,255,0.9) !important;
    border-color: rgba(0,0,0,0.3) !important;
    color: #1C1917 !important;
  }
  .im-back:hover { color: #1C1917 !important; }

  .im-input::placeholder {
    color: rgba(0,0,0,0.25);
    font-style: italic;
  }
  .im-input:focus {
    background: #ffffff !important;
    border-color: rgba(0,0,0,0.2) !important;
    outline: none;
  }
  .im-input:disabled { opacity: 0.4; cursor: not-allowed; }

  .im-scroll::-webkit-scrollbar { width: 0; height: 0; }
  .im-scroll { scrollbar-width: none; }
`

// ─── ID counter ────────────────────────────────────────────────
let _uid = 0
const uid = () => ++_uid

// ─── Phase indicator ───────────────────────────────────────────
function PhaseIndicator({ phase }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      fontFamily: UI,
      fontSize: 12.5,
      userSelect: 'none',
    }}>
      {PHASES.map((label, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && (
            <span style={{
              display: 'inline-block',
              width: 28,
              height: 1,
              background: 'rgba(0,0,0,0.1)',
              margin: '0 10px',
              flexShrink: 0,
            }} />
          )}
          <span style={{
            color: TEXT,
            opacity: i === phase ? 1 : i < phase ? 0.35 : 0.25,
            fontWeight: i === phase ? 600 : 400,
            transition: 'opacity 300ms ease',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
        </span>
      ))}
    </div>
  )
}

// ─── Typing indicator ──────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '6px 0 20px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'inline-block',
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.25)',
          animation: 'im-dot 1.2s ease-in-out infinite',
          animationDelay: `${i * 200}ms`,
        }} />
      ))}
    </div>
  )
}

// ─── Chip ──────────────────────────────────────────────────────
function Chip({ label, delay, onClick }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <button
      className="im-chip"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        color: 'rgba(0,0,0,0.55)',
        cursor: 'pointer',
        fontFamily: UI,
        whiteSpace: 'nowrap',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: [
          'opacity 200ms ease',
          'transform 200ms ease',
          'background 150ms',
          'border-color 150ms',
          'color 150ms',
        ].join(', '),
      }}
    >
      {label}
    </button>
  )
}

// ─── Message: system ───────────────────────────────────────────
function SystemMsg({ msgId, text, chips, onSend, visible }) {
  return (
    <div style={{
      marginBottom: 20,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 250ms ease-out, transform 250ms ease-out',
    }}>
      <p style={{
        margin: 0,
        fontSize: 16,
        lineHeight: 1.75,
        fontWeight: 400,
        color: 'rgba(28,25,23,0.8)',
        maxWidth: 520,
        fontFamily: UI,
      }}>
        {text}
      </p>

      {chips && chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {chips.map((chip, i) => (
            <Chip
              key={chip}
              label={chip}
              delay={i * 80}
              onClick={() => onSend(chip, msgId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Message: user ─────────────────────────────────────────────
function UserMsg({ text, visible }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: 24,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 250ms ease-out, transform 250ms ease-out',
    }}>
      <div style={{
        background: TEXT,
        color: '#F4F1EC',
        borderRadius: 24,
        padding: '10px 18px',
        fontSize: 15,
        lineHeight: 1.5,
        maxWidth: '75%',
        fontFamily: UI,
      }}>
        {text}
      </div>
    </div>
  )
}

// ─── Word extraction ────────────────────────────────────────────
function extractWords(messages) {
  const stop = new Set([
    'the','a','an','is','are','was','were','i','it','its','this','that',
    'to','of','and','or','for','in','on','with','my','me','we','you',
    'do','be','have','has','not','just','like','about','what','how',
    'who','when','can','will','would','could','should','there','here',
    'some','all','if','from','but','so','at','by','as','up','am',
    'dont','also','only','more','very','want','need','use','get',
    'make','sure','still','already','yet','much','many','than',
    'then','them','they','their','other','into','been','going',
  ])
  const userText = messages
    .filter(m => m.type === 'user')
    .map(m => m.text)
    .join(' ')
  const extracted = [...new Set(
    userText.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !stop.has(w))
  )]
  const fill = [
    'features', 'structure', 'scope', 'stack', 'tasks',
    'interface', 'backend', 'design', 'logic', 'flow',
    'schema', 'routes', 'components', 'database', 'frontend',
    'users', 'data', 'launch', 'system', 'build',
  ]
  return [...extracted, ...fill.filter(w => !extracted.includes(w))].slice(0, 22)
}

// ─── Building overlay ────────────────────────────────────────────
const CIRC = +(2 * Math.PI * 32).toFixed(1) // r=32 ≈ 201.1

// Returns a starting position that doesn't land on the center loading box.
// Words in the center x-band are pushed to the upper third so they've
// already drifted clear of the ring area by the time they loop back.
function safePos() {
  let x, y
  do {
    x = 3 + Math.random() * 87
    y = 3 + Math.random() * 87
  } while (x > 27 && x < 73 && y > 37 && y < 66)
  return { x, y }
}

function BuildingOverlay({ messages, onDone }) {
  const [fading, setFading] = useState(false)
  const DURATION = 7800
  const wordsData = useRef(null)
  if (!wordsData.current) {
    wordsData.current = extractWords(messages).map(word => {
      const { x, y } = safePos()
      return {
        word, x, y,
        opacity: 0.17 + Math.random() * 0.68,
        size: 11 + Math.floor(Math.random() * 13),
        duration: 14 + Math.random() * 12,
        delay: -(2 + Math.random() * 9),
      }
    })
  }
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), DURATION)
    const t2 = setTimeout(onDone, DURATION + 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: BG, zIndex: 20,
      overflow: 'hidden',
      opacity: fading ? 0 : 1,
      transition: fading ? 'opacity 700ms ease' : 'none',
    }}>
      {wordsData.current.map(({ word, x, y, opacity, size, duration, delay }, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          fontSize: size,
          fontFamily: UI,
          color: TEXT,
          opacity,
          animation: `bw-float ${duration}s linear ${delay}s infinite`,
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
        }}>
          {word}
        </span>
      ))}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20,
        zIndex: 1,
      }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          <circle
            cx={40} cy={40} r={32}
            fill="none"
            stroke="rgba(0,0,0,0.07)"
            strokeWidth={1.5}
          />
          <circle
            cx={40} cy={40} r={32}
            fill="none"
            stroke="rgba(28,25,23,0.65)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            style={{
              transformOrigin: '40px 40px',
              transform: 'rotate(-90deg)',
              animation: `bw-arc ${DURATION}ms linear forwards`,
            }}
          />
        </svg>
        <p style={{
          margin: 0, fontSize: 13, fontFamily: UI,
          color: 'rgba(28,25,23,0.4)', fontWeight: 500,
          letterSpacing: '0.03em',
        }}>
          Building your project brain…
        </p>
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────
export default function InterviewMock() {
  const navigate = useNavigate()

  const [messages, setMessages]   = useState([])
  const [phase, setPhase]         = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const [building, setBuilding]   = useState(false)
  const [input, setInput]         = useState('')

  const scriptStepRef = useRef(1)   // next SCRIPT index to process
  const waitingRef    = useRef(false) // true while AI is "thinking"
  const bottomRef     = useRef(null)

  // ── Mount: show SCRIPT[0] immediately ──
  useEffect(() => {
    const id = uid()
    setMessages([{
      id, type: 'system',
      text: SCRIPT[0].text,
      chips: SCRIPT[0].chips,
      visible: false,
    }])
    // One frame delay so the initial render is invisible, then fade in
    const t = setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, visible: true } : m))
    }, 50)
    return () => clearTimeout(t)
  }, [])

  // ── Auto-scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showTyping])

  // ── Add a message (invisible → fade in) ──
  function pushMsg(msg) {
    const id = uid()
    setMessages(prev => [...prev, { ...msg, id, visible: false }])
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, visible: true } : m))
    }, 20)
    return id
  }

  // ── Send ──
  function sendMessage(text, fromMsgId = null) {
    const trimmed = text.trim()
    if (!trimmed || waitingRef.current || building) return

    setInput('')

    // Consume chips on the originating system message
    if (fromMsgId !== null) {
      setMessages(prev =>
        prev.map(m => m.id === fromMsgId ? { ...m, chips: [] } : m)
      )
    }

    pushMsg({ type: 'user', text: trimmed })

    const step = scriptStepRef.current
    if (step >= SCRIPT.length) return

    scriptStepRef.current = step + 1
    waitingRef.current = true

    const next = SCRIPT[step]

    // Phase transition fires immediately (CSS handles the 300ms crossfade)
    if (next.phaseTransition !== null) {
      setPhase(next.phaseTransition)
    }

    // Typing indicator appears after 300ms
    setTimeout(() => setShowTyping(true), 300)

    // System reply arrives after typingMs
    setTimeout(() => {
      setShowTyping(false)
      pushMsg({ type: 'system', text: next.text, chips: next.chips })
      waitingRef.current = false

      if (next.isLast) {
        setTimeout(() => setBuilding(true), 600)
      }
    }, 300 + next.typingMs)
  }

  const hasInput = input.trim().length > 0

  return (
    <>
      <style>{CSS}</style>

      <div style={{
        fontFamily: UI,
        background: BG,
        color: TEXT,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Topbar ── */}
        <header style={{
          height: 56,
          background: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0,
          position: 'relative',
        }}>
          <button
            className="im-back"
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.28)',
              fontSize: 20,
              lineHeight: 1,
              padding: '4px 8px 4px 0',
              fontFamily: UI,
              transition: 'color 150ms',
            }}
          >
            ←
          </button>

          {/* Phase indicator — absolute center */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}>
            <PhaseIndicator phase={phase} />
          </div>

          {/* Balance spacer */}
          <div style={{ width: 32 }} />
        </header>

        {/* ── Thread ── */}
        <div
          className="im-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 32px 120px',
          }}
        >
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {messages.map(msg =>
              msg.type === 'system'
                ? <SystemMsg
                    key={msg.id}
                    msgId={msg.id}
                    text={msg.text}
                    chips={msg.chips}
                    onSend={sendMessage}
                    visible={msg.visible}
                  />
                : <UserMsg
                    key={msg.id}
                    text={msg.text}
                    visible={msg.visible}
                  />
            )}

            {showTyping && <TypingDots />}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Bottom input bar ── */}
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: BG,
          borderTop: '1px solid rgba(0,0,0,0.07)',
          padding: '16px 24px',
          zIndex: 10,
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
            <input
              className="im-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(input) }}
              placeholder="say anything…"
              disabled={building}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 28,
                padding: `14px ${hasInput ? '52px' : '22px'} 14px 22px`,
                fontSize: 14,
                fontFamily: UI,
                color: TEXT,
                boxSizing: 'border-box',
                transition: 'background 150ms, border-color 150ms, padding 150ms ease',
              }}
            />
            {hasInput && (
              <button
                onClick={() => sendMessage(input)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 34, height: 34,
                  borderRadius: '50%',
                  background: TEXT,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'im-fadeIn 150ms ease both',
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                  stroke="#F4F1EC" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M6 12L3.27 3.126A59.77 59.77 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Building overlay ── */}
        {building && (
          <BuildingOverlay
            messages={messages}
            onDone={() => navigate('/brief')}
          />
        )}
      </div>
    </>
  )
}
