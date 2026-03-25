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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#2A5FE6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      {/* Top bar */}
      <header className="border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">
            Welcome back, {user.name}
          </h1>
          <p className="text-[#6B6B6B] mt-1">
            {ROLE_LABELS[user.role] || user.role}
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#9B9B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Ready to build something?</h2>
            <p className="text-[#6B6B6B] mb-8 max-w-sm">
              Start your first project. We'll help you scope it out and break it
              into buildable tasks.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 bg-[#2A5FE6] hover:bg-[#1E4FCC] text-white rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer"
            >
              Start a Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-[#E5E5E5] hover:border-[#D4D4D4] text-[#9B9B9B] hover:text-[#6B6B6B] transition-all duration-150 cursor-pointer min-h-[160px]"
            >
              <svg className="w-7 h-7 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
