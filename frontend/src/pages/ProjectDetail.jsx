import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useBreadcrumbs } from '../contexts/NavContext'
import {
  getProject,
  listTasks,
  getScopeMessages,
  sendScopeMessage,
} from '../api/client'
import StatusBadge from '../components/StatusBadge'
import ChatPanel, { formatTime } from '../components/ChatPanel'

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ── Scope Section ──────────────────────────────────────────────

function ScopeSection({ project }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/50">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={project.status} />
              {project.tech_stack?.length > 0 && (
                <span className="text-xs text-zinc-500">
                  {project.tech_stack.join(' / ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {project.scope_summary && (
          <p className="text-sm text-zinc-400 leading-relaxed mt-3">
            {project.scope_summary}
          </p>
        )}

        {project.scope_detail && (
          <>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              {expanded ? 'Collapse scope' : 'Expand full scope'}
            </button>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-zinc-800 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {project.scope_detail}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Scope Chat Slide-over ──────────────────────────────────────

function ScopeChatPanel({ projectId, projectName, onTaskCreated, onScopeUpdated }) {
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getScopeMessages(projectId)
      .then((existing) => {
        setMessages(
          existing
            .filter((m) => !m.content.includes('===INTERVIEW_COMPLETE==='))
            .map((m) => ({
              role: m.role,
              content: m.content,
              timestamp: formatTime(new Date(m.created_at)),
            }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  async function handleSend(text) {
    const userMsg = { role: 'user', content: text, timestamp: formatTime(new Date()) }
    setMessages((prev) => [...prev, userMsg])
    setSending(true)

    try {
      const data = await sendScopeMessage(projectId, text)
      const assistantMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: formatTime(new Date()),
      }
      setMessages((prev) => [...prev, assistantMsg])

      if (data.created_task) {
        onTaskCreated(data.created_task)
      }
      if (data.updated_scope) {
        onScopeUpdated(data.updated_scope)
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
      placeholder={`Chat about ${projectName}...`}
      className="h-full"
    />
  )
}

// ── Task Row ───────────────────────────────────────────────────

function TaskRow({ task, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors cursor-pointer rounded-lg group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-zinc-100 group-hover:text-white truncate">
            {task.title}
          </span>
          <StatusBadge status={task.status} />
        </div>
        {task.task_summary && (
          <p className="text-xs text-zinc-500 truncate">{task.task_summary}</p>
        )}
      </div>
      <span className="text-xs text-zinc-600 flex-shrink-0">
        {timeAgo(task.updated_at)}
      </span>
      <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  )
}

// ── Main Page ──────────────────────────────────────────────────

export default function ProjectDetail() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const { loading: userLoading } = useUser()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  useBreadcrumbs(
    project ? [{ label: project.name }] : []
  )

  useEffect(() => {
    if (!projectId) return
    Promise.all([getProject(projectId), listTasks(projectId)])
      .then(([p, t]) => {
        setProject(p)
        setTasks(t)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [projectId])

  function handleTaskCreated(task) {
    setTasks((prev) => [...prev, task])
  }

  function handleScopeUpdated(updatedProject) {
    setProject((prev) => ({ ...prev, ...updatedProject }))
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-zinc-100 mb-2">Couldn't load project</h1>
          <p className="text-sm text-zinc-400 mb-6">{error || 'Project not found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const activeTasks = tasks.filter((t) => t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const displayTasks = activeTab === 'tasks' ? activeTasks : doneTasks

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* SECTION 1 — Scope Box */}
        <ScopeSection project={project} />

        {/* Scope Chat Trigger */}
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <span className="text-sm">New chat in {project.name}</span>
        </button>

        {/* SECTION 2 — Task List */}
        <div>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === 'tasks'
                  ? 'text-zinc-100 border-indigo-500'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              Tasks{activeTasks.length > 0 && ` (${activeTasks.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === 'archive'
                  ? 'text-zinc-100 border-indigo-500'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              Archive{doneTasks.length > 0 && ` (${doneTasks.length})`}
            </button>
          </div>

          {/* Task list */}
          {displayTasks.length > 0 ? (
            <div className="space-y-1">
              {displayTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => navigate(`/project/${projectId}/task/${task.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              {activeTab === 'tasks' ? (
                <>
                  <p className="text-zinc-500 mb-2">No tasks yet</p>
                  <p className="text-sm text-zinc-600">
                    Chat above to start breaking your project into tasks.
                  </p>
                </>
              ) : (
                <p className="text-zinc-500">No archived tasks</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Scope Chat Slide-over */}
      {chatOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setChatOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50 flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold">{project.name}</h2>
                <p className="text-xs text-zinc-500">Project Chat</p>
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

            {/* Chat content */}
            <ScopeChatPanel
              projectId={projectId}
              projectName={project.name}
              onTaskCreated={handleTaskCreated}
              onScopeUpdated={handleScopeUpdated}
            />
          </div>
        </>
      )}
    </div>
  )
}
