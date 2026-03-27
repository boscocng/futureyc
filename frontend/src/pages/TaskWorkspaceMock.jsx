import { useState, useEffect, useRef } from 'react'

// ─── Design tokens ────────────────────────────────────────────
const C = {
  bg:          '#F4F1EC',
  text:        '#1C1917',
  accent:      '#A07850',
  muted:       '#78716C',
  border:      'rgba(28,25,23,0.13)',
  borderLight: 'rgba(28,25,23,0.07)',
  ui:   "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'DM Mono', 'Courier New', monospace",
}

// ─── Mock conversation ────────────────────────────────────────
const EXCHANGES = [
  {
    system: "What would you like to build for your fitness tracker?",
    chips: ["Workout logging form", "User login & signup", "Progress dashboard", "Settings page"],
  },
  {
    system: "Good choice. What's your tech stack? This shapes the prompt significantly.",
    chips: ["React + FastAPI", "Next.js + Node", "Vue + Express", "Not sure yet"],
  },
  {
    system: "Got it. Any existing files I need to know about, or are we starting fresh?",
    chips: ["Starting fresh", "I have a basic layout already", "There's some existing API code"],
  },
  {
    system: "Perfect — I have everything I need. Here's your prompt. Drop it straight into Claude Code or Cursor.",
    chips: [],
  },
]

// ─── Prompt sections ──────────────────────────────────────────
const SECTIONS = [
  {
    key: 'context',
    label: 'CONTEXT',
    content: `Project: Personal fitness tracker
Stack: React frontend, FastAPI backend, SQLite
Existing layout component at src/components/Layout.jsx
No authentication yet — single local user assumed`,
  },
  {
    key: 'task',
    label: 'TASK',
    content: `Build a workout logging form component.
Fields: exercise name (text), sets (number), reps (number),
        duration in minutes (number), date (default today).
On submit → POST /api/workouts with JSON body.
On success → clear form, show inline "Logged." confirmation.
On error → show inline error message, do not clear form.`,
  },
  {
    key: 'touchOnly',
    label: 'TOUCH ONLY',
    content: `src/components/WorkoutForm.jsx       (create new)
src/api/client.js                    (add postWorkout helper)
backend/app/routes/workouts.py       (create new route)`,
  },
  {
    key: 'doNotTouch',
    label: 'DO NOT TOUCH',
    content: `src/components/Layout.jsx
src/contexts/UserContext.jsx
backend/app/database.py
All existing DB models and migrations`,
  },
  {
    key: 'success',
    label: 'SUCCESS LOOKS LIKE',
    content: `Form renders with all five fields visible
Valid submission writes a row to the workouts table
Form resets after a successful submit
A failed request surfaces a user-facing message
No TypeErrors in console, no 422s from the API`,
  },
]

const PROGRESS_STEPS = [
  "Define idea",
  "Choose stack",
  "Set scope",
  "Map files",
  "Set boundaries",
  "Define success",
  "Review",
]

const PROMPT_SUMMARY =
  "Tells your AI coding tool to build a self-contained workout form that POSTs to your FastAPI backend — specifying exactly which files to create and which to leave alone."

// ─── Shared animations / global CSS ──────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=DM+Mono&display=swap');

  @keyframes pulseGreen {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.25; }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes chipFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .tw-dot:hover .tw-tooltip { opacity: 1 !important; }

  .tw-chip:hover {
    border-color: rgba(28,25,23,0.5) !important;
    background: rgba(28,25,23,0.04) !important;
  }

  .tw-input::placeholder {
    color: #78716C;
    font-style: italic;
  }
  .tw-input:focus {
    border-color: rgba(28,25,23,0.35) !important;
    outline: none;
  }

  .tw-copy-btn:hover { color: #1C1917 !important; }

  /* hide scrollbar globally for this page */
  .tw-scroll::-webkit-scrollbar { width: 0; height: 0; }
  .tw-scroll { scrollbar-width: none; }
`

// ─── Topbar ───────────────────────────────────────────────────
function TopBar({ currentStep }) {
  return (
    <header style={{
      height: 52,
      borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
      background: C.bg,
    }}>
      {/* Brain active */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '4px 11px',
        border: `1px solid ${C.border}`,
        borderRadius: 99,
        fontSize: 12, color: C.muted,
        fontFamily: C.ui,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#22C55E',
          flexShrink: 0,
          animation: 'pulseGreen 2s ease-in-out infinite',
        }} />
        Brain active
      </div>

      {/* Project name */}
      <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: C.ui }}>
        Fitness Tracker
      </span>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        {PROGRESS_STEPS.map((label, i) => {
          const done    = i < currentStep
          const current = i === currentStep
          return (
            <div key={i} className="tw-dot" style={{ position: 'relative', cursor: 'default' }}>
              <div style={{
                width:        current ? 9 : 7,
                height:       current ? 9 : 7,
                borderRadius: '50%',
                background:   done || current ? C.text : 'transparent',
                border:       done || current ? 'none' : `1.5px solid rgba(28,25,23,0.3)`,
                opacity:      done ? 0.4 : current ? 1 : 0.3,
                transition:   'all 250ms ease',
              }} />
              <div className="tw-tooltip" style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%', transform: 'translateX(-50%)',
                background: C.text, color: C.bg,
                fontSize: 11, padding: '3px 8px', borderRadius: 4,
                whiteSpace: 'nowrap', pointerEvents: 'none',
                opacity: 0, transition: 'opacity 100ms ease',
                fontFamily: C.ui,
              }}>
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </header>
  )
}

// ─── Chip ─────────────────────────────────────────────────────
function Chip({ label, delay, onClick }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <button
      className="tw-chip"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        border: `1px solid ${C.border}`,
        borderRadius: 99,
        background: 'transparent',
        fontSize: 13, color: C.text,
        cursor: 'pointer',
        fontFamily: C.ui,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(4px)',
        transition: 'opacity 200ms ease, transform 200ms ease, border-color 120ms, background 120ms',
      }}
    >
      {label}
    </button>
  )
}

// ─── Message types ────────────────────────────────────────────
function SystemMsg({ text, chips, onChip, visible }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', gap: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(6px)',
      transition: 'opacity 200ms ease, transform 200ms ease',
    }}>
      <p style={{
        margin: 0, fontSize: 14, lineHeight: 1.7,
        color: C.text, maxWidth: 480, fontFamily: C.ui,
      }}>
        {text}
      </p>
      {chips && chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {chips.map((chip, i) => (
            <Chip key={chip} label={chip} delay={i * 80} onClick={() => onChip(chip)} />
          ))}
        </div>
      )}
    </div>
  )
}

function UserMsg({ text, visible }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'flex-end',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(6px)',
      transition: 'opacity 200ms ease, transform 200ms ease',
    }}>
      <div style={{
        background: C.text, color: C.bg,
        padding: '9px 18px',
        borderRadius: 99,
        fontSize: 14, lineHeight: 1.5,
        maxWidth: 360, fontFamily: C.ui,
      }}>
        {text}
      </div>
    </div>
  )
}

// ─── Prompt card ──────────────────────────────────────────────
function PromptSection({ section }) {
  return (
    <div style={{ animation: 'fadeSlideIn 300ms ease both' }}>
      <div style={{
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.1em', color: C.accent,
        textTransform: 'uppercase',
        marginBottom: 9, fontFamily: C.ui,
      }}>
        {section.label}
      </div>
      <pre style={{
        fontFamily: C.mono,
        fontSize: 12, lineHeight: 1.9,
        color: C.text, margin: 0,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {section.content}
      </pre>
    </div>
  )
}

function PromptCard({ sections, copied, flashing, onCopy }) {
  const empty = sections.length === 0
  const full  = sections.length === SECTIONS.length

  return (
    <div style={{
      border: flashing
        ? '1px solid #22C55E'
        : `1px solid ${C.border}`,
      borderRadius: 6,
      transition: 'border-color 150ms ease',
      fontFamily: C.ui,
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 18px',
        borderBottom: `1px solid ${C.borderLight}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 600,
          letterSpacing: '0.1em', color: C.accent,
          textTransform: 'uppercase',
        }}>
          Prompt
        </span>
        {!empty && (
          <button
            className="tw-copy-btn"
            onClick={onCopy}
            style={{
              fontSize: 12, color: copied ? '#22C55E' : C.muted,
              background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: C.ui,
              transition: 'color 150ms', padding: 0,
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '22px 18px' }}>
        {empty ? (
          <p style={{
            margin: 0, fontSize: 13,
            color: C.muted, lineHeight: 1.65,
            opacity: 0.8,
          }}>
            Your prompt assembles here as we work through the details.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {sections.map(s => <PromptSection key={s.key} section={s} />)}

            {full && (
              <div style={{
                borderTop: `1px solid ${C.borderLight}`,
                paddingTop: 18,
                animation: 'fadeSlideIn 300ms ease both',
              }}>
                <p style={{
                  margin: 0, fontSize: 13,
                  color: C.muted, lineHeight: 1.65,
                }}>
                  {PROMPT_SUMMARY}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────
let _msgId = 0
const newId = () => ++_msgId

export default function TaskWorkspaceMock() {
  const [messages, setMessages] = useState(() => [{
    id: newId(), type: 'system',
    text: EXCHANGES[0].system,
    chips: EXCHANGES[0].chips,
    visible: true,
  }])
  const [exchangeIdx, setExchangeIdx] = useState(0)
  const [input, setInput]             = useState('')
  const [promptSections, setPromptSections] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [copied, setCopied]           = useState(false)
  const [cardFlash, setCardFlash]     = useState(false)

  const bottomRef = useRef(null)

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Add a message invisible, then fade it in
  function pushMessage(msg) {
    const id = newId()
    setMessages(prev => [...prev, { ...msg, id, visible: false }])
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, visible: true } : m))
    }, 20)
  }

  function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput('')

    // Remove chips from last system message
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 && m.type === 'system' ? { ...m, chips: [] } : m
    ))

    pushMessage({ type: 'user', text: trimmed })

    const nextIdx = exchangeIdx + 1
    if (nextIdx >= EXCHANGES.length) return

    setExchangeIdx(nextIdx)
    setCurrentStep(nextIdx)

    // System reply after short delay
    setTimeout(() => {
      const next = EXCHANGES[nextIdx]
      pushMessage({ type: 'system', text: next.system, chips: next.chips })

      // Last exchange → fill prompt card section by section
      if (nextIdx === EXCHANGES.length - 1) {
        SECTIONS.forEach((section, i) => {
          setTimeout(() => {
            setPromptSections(prev => [...prev, section])
            setCurrentStep(2 + i + 1) // steps 3→7 as sections appear
          }, (i + 1) * 400)
        })
      }
    }, 550)
  }

  function handleCopy() {
    const text = promptSections.map(s => `${s.label}\n${s.content}`).join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setCardFlash(true)
      setTimeout(() => setCardFlash(false), 150)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        fontFamily: C.ui, background: C.bg, color: C.text,
        height: '100vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <TopBar currentStep={currentStep} />

        {/* Two-column body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

          {/* Left — 60% chat */}
          <div className="tw-scroll" style={{
            flex: '0 0 60%', overflowY: 'auto',
            padding: '40px 48px 28px',
            display: 'flex', flexDirection: 'column', gap: 26,
          }}>
            {messages.map(msg =>
              msg.type === 'system'
                ? <SystemMsg key={msg.id} text={msg.text} chips={msg.chips} onChip={sendMessage} visible={msg.visible} />
                : <UserMsg   key={msg.id} text={msg.text} visible={msg.visible} />
            )}
            <div ref={bottomRef} />
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: C.border, flexShrink: 0 }} />

          {/* Right — 40% prompt card */}
          <div className="tw-scroll" style={{
            flex: '0 0 40%', overflowY: 'auto',
            padding: '40px 32px 28px',
          }}>
            <PromptCard
              sections={promptSections}
              copied={copied}
              flashing={cardFlash}
              onCopy={handleCopy}
            />
          </div>
        </div>

        {/* Bottom input */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: '18px 48px',
          background: C.bg, flexShrink: 0,
        }}>
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input) }}
            style={{ position: 'relative' }}
          >
            <input
              className="tw-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="tell me what you want to build next…"
              style={{
                width: '100%',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 99,
                padding: `13px ${input.trim() ? '52px' : '22px'} 13px 22px`,
                fontSize: 14, fontFamily: C.ui, color: C.text,
                fontStyle: input ? 'normal' : 'italic',
                transition: 'padding 150ms ease',
              }}
            />
            {input.trim() && (
              <button type="submit" style={{
                position: 'absolute', right: 8, top: '50%',
                transform: 'translateY(-50%)',
                width: 34, height: 34, borderRadius: '50%',
                background: C.text, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'fadeSlideIn 150ms ease both',
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                  stroke={C.bg} strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M6 12L3.27 3.126A59.77 59.77 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
