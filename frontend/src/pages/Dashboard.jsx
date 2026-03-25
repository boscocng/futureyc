import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useBreadcrumbs } from '../contexts/NavContext'
import { listProjects, createProject } from '../api/client'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/NewProjectModal'

const ROLE_LABELS = {
  student: 'Student',
  educator: 'Educator',
  pm: 'Product Manager',
  developer: 'Developer',
  designer: 'Designer',
  founder: 'Founder',
  other: 'Explorer',
}

export default function Dashboard() {
  const { user, loading: userLoading } = useUser()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useBreadcrumbs([])

  useEffect(() => {
    if (userLoading) return
    if (!user) {
      navigate('/onboarding')
      return
    }
    listProjects(user.id)
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, userLoading, navigate])

  async function handleCreate(name) {
    try {
      const project = await createProject(user.id, name)
      setShowModal(false)
      navigate(`/project/${project.id}/interview`)
    } catch (err) {
      setError(err.message)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-zinc-400 mt-1">
            {ROLE_LABELS[user.role] || user.role}
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-300">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Ready to build something?</h2>
            <p className="text-zinc-400 mb-8 max-w-sm">
              Start your first project. We'll help you scope it out and break it
              into buildable tasks.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Start a Project
            </button>
          </div>
        ) : (
          /* Project grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}

            {/* New project card */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 transition-all duration-200 cursor-pointer min-h-[160px]"
            >
              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-sm font-medium">New Project</span>
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
