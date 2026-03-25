import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useBreadcrumbs } from '../contexts/NavContext'
import {
  getTask,
  getProject,
  updateTask,
  sendTaskMessage,
  getTaskMessages,
  generatePrompt,
} from '../api/client'
import StatusBadge from '../components/StatusBadge'
import ChatPanel, { formatTime } from '../components/ChatPanel'

// ── Editable Title ────────────────────────────────────────────

function EditableTitle({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleSave() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setDraft(value)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        className="text-xl font-bold tracking-tight bg-transparent border-b border-indigo-500 outline-none text-zinc-100 w-full"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-xl font-bold tracking-tight text-left hover:text-indigo-300 transition-colors cursor-pointer"
      title="Click to edit"
    >
      {value}
    </button>
  )
}

// ── Prompt Modal ──────────────────────────────────────────────

function PromptModal({ prompt, onClose, onRegenerate, regenerating }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-4 sm:inset-10 z-50 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 flex-shrink-0">
          <h2 className="text-sm font-semibold">Generated Prompt</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors cursor-pointer disabled:opacity-50"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">
            {prompt}
          </pre>
        </div>
      </div>
    </>
  )
}

// ── Task Chat Panel ───────────────────────────────────────────

function TaskChatPanel({ taskId, task, onTaskUpdated }) {
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTaskMessages(taskId)
      .then((existing) => {
        if (existing.length > 0) {
          setMessages(
            existing
              .filter((m) => !m.content.includes('===TASK_UPDATED==='))
              .map((m) => ({
                role: m.role,
                content: m.content.split('===TASK_UPDATED===')[0].trim() || m.content,
                timestamp: formatTime(new Date(m.created_at)),
              }))
          )
        } else {
          // Auto-greeting: show a summary of the task
          const greeting = task?.task_summary
            ? `Here's what we have for "${task.title}":\n\n${task.task_summary}\n\nHow would you like to refine this task? I can help update the implementation plan, clarify requirements, or adjust the scope.`
            : `Let's work on "${task?.title || 'this task'}". What would you like to discuss or refine?`
          setMessages([
            {
              role: 'assistant',
              content: greeting,
              timestamp: formatTime(new Date()),
            },
          ])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [taskId, task?.title, task?.task_summary])

  async function handleSend(text) {
    const userMsg = { role: 'user', content: text, timestamp: formatTime(new Date()) }
    setMessages((prev) => [...prev, userMsg])
    setSending(true)

    try {
      const data = await sendTaskMessage(taskId, text)
      const assistantMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: formatTime(new Date()),
      }
      setMessages((prev) => [...prev, assistantMsg])

      if (data.updated_task) {
        onTaskUpdated(data.updated_task)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.', timestamp: formatTime(new Date()) },
      ])
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <ChatPanel
      messages={messages}
      onSend={handleSend}
      sending={sending}
      placeholder="Chat about this task..."
      className="h-full"
    />
  )
}

// ── Main Page ─────────────────────────────────────────────────

export default function TaskDetail() {
  const { id: projectId, taskId } = useParams()
  const navigate = useNavigate()
  const { loading: userLoading } = useUser()

  const [task, setTask] = useState(null)
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [planExpanded, setPlanExpanded] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [promptModalOpen, setPromptModalOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  useBreadcrumbs(
    projectName
      ? [
          { label: projectName, to: `/project/${projectId}` },
          { label: task?.title || 'Task' },
        ]
      : []
  )

  useEffect(() => {
    if (!taskId) return
    Promise.all([
      getTask(taskId),
      getProject(projectId),
    ])
      .then(([t, p]) => {
        setTask(t)
        setProjectName(p.name)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [taskId, projectId])

  function handleTaskUpdated(updatedTask) {
    setTask((prev) => ({ ...prev, ...updatedTask }))
  }

  async function handleTitleSave(newTitle) {
    try {
      const updated = await updateTask(taskId, { title: newTitle })
      setTask((prev) => ({ ...prev, ...updated }))
    } catch {
      // revert handled by EditableTitle
    }
  }

  async function handleGeneratePrompt() {
    setGenerating(true)
    try {
      const data = await generatePrompt(taskId)
      setTask((prev) => ({ ...prev, ...data.task }))
      setPromptModalOpen(true)
    } catch (err) {
      setError(`Failed to generate prompt: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !task) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-zinc-100 mb-2">Couldn't load task</h1>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Back to Project
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Task Summary Box */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <EditableTitle value={task.title} onSave={handleTitleSave} />
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={task.status} />
              </div>
            </div>
          </div>

          {task.task_summary && (
            <p className="text-sm text-zinc-400 leading-relaxed mt-3">
              {task.task_summary}
            </p>
          )}

          {task.implementation_plan && (
            <>
              <button
                type="button"
                onClick={() => setPlanExpanded(!planExpanded)}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {planExpanded ? 'Collapse plan' : 'Expand implementation plan'}
              </button>

              {planExpanded && (
                <div className="mt-3 pt-3 border-t border-zinc-800 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {task.implementation_plan}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Generate Prompt Button */}
          <button
            type="button"
            onClick={task.generated_prompt ? () => setPromptModalOpen(true) : handleGeneratePrompt}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            {generating ? 'Generating...' : task.generated_prompt ? 'View Prompt' : 'Generate Prompt'}
          </button>

          {/* Chat Trigger */}
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 text-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            Refine Task
          </button>
        </div>
      </main>

      {/* Task Chat Slide-over */}
      {chatOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setChatOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50 flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold">{task.title}</h2>
                <p className="text-xs text-zinc-500">Task Chat</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TaskChatPanel
              taskId={taskId}
              task={task}
              onTaskUpdated={handleTaskUpdated}
            />
          </div>
        </>
      )}

      {/* Prompt Modal */}
      {promptModalOpen && task.generated_prompt && (
        <PromptModal
          prompt={task.generated_prompt}
          onClose={() => setPromptModalOpen(false)}
          onRegenerate={handleGeneratePrompt}
          regenerating={generating}
        />
      )}
    </div>
  )
}
