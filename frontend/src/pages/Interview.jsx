import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { getProject, sendInterviewMessage, getInterviewMessages } from '../api/client'
import ChatPanel, { formatTime } from '../components/ChatPanel'

export default function Interview() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const { user, loading: userLoading } = useUser()

  const [project, setProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [complete, setComplete] = useState(false)
  const [loadingProject, setLoadingProject] = useState(true)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) return
    getProject(projectId)
      .then((p) => {
        setProject(p)
        if (p.status === 'active') setComplete(true)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingProject(false))
  }, [projectId])

  useEffect(() => {
    if (loadingProject || !project || complete || started) return
    setStarted(true)

    getInterviewMessages(projectId).then((existing) => {
      if (existing.length > 0) {
        setMessages(
          existing.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: formatTime(new Date(m.created_at)),
          }))
        )
        setComplete(true)
      } else {
        doSend('Hi, I want to start planning my project.', [])
      }
    }).catch((err) => setError(err.message))
  }, [loadingProject, project, complete, started, projectId])

  async function doSend(content, currentHistory) {
    const userMsg = { role: 'user', content, timestamp: formatTime(new Date()) }
    const updated = [...currentHistory, userMsg]
    setMessages(updated)
    setSending(true)
    setError(null)

    try {
      const historyForApi = currentHistory.map(({ role, content }) => ({ role, content }))
      const data = await sendInterviewMessage(projectId, content, historyForApi)
      const assistantMsg = { role: 'assistant', content: data.response, timestamp: formatTime(new Date()) }
      setMessages((prev) => [...prev, assistantMsg])

      if (data.interview_complete) {
        setComplete(true)
        if (data.project) setProject(data.project)
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

  if (loadingProject || userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#2A5FE6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-[#1A1A1A] mb-2">Couldn't load project</h1>
          <p className="text-sm text-[#6B6B6B] mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-[#2A5FE6] hover:bg-[#1E4FCC] text-white text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white text-[#1A1A1A] flex flex-col">
      <header className="border-b border-[#E5E5E5] px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors duration-150 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-semibold text-[#1A1A1A]">{project?.name}</h1>
              <p className="text-sm text-[#9B9B9B]">Project Interview</p>
            </div>
          </div>
          {complete && (
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="px-4 py-2 bg-[#2A5FE6] hover:bg-[#1E4FCC] text-white text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer"
            >
              View Project
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          <ChatPanel
            messages={messages}
            onSend={(text) => doSend(text, messages)}
            sending={sending}
            disabled={complete}
            placeholder="Type your message..."
            className="flex-1"
          />

          {complete && (
            <div className="px-4 pb-6">
              <div className="p-5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] text-center">
                <h3 className="text-base font-semibold text-[#16A34A] mb-2">Your project is ready!</h3>
                <p className="text-sm text-[#6B6B6B] mb-4">
                  We've created a scope, tech stack, and initial task breakdown for you.
                </p>
                <button
                  onClick={() => navigate(`/project/${projectId}`)}
                  className="px-6 py-2.5 bg-[#2A5FE6] hover:bg-[#1E4FCC] text-white text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer"
                >
                  Go to Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
