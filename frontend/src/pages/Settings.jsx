import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useBreadcrumbs } from '../contexts/NavContext'
import { updateUserProfile } from '../api/client'
import SelectCard from '../components/SelectCard'

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'educator', label: 'Educator' },
  { value: 'pm', label: 'Product Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'founder', label: 'Founder' },
  { value: 'other', label: 'Other' },
]

const CODING_LEVELS = [
  { value: 1, label: 'Never coded' },
  { value: 2, label: "I've copy-pasted some code" },
  { value: 3, label: 'I can follow tutorials' },
  { value: 4, label: 'I build things sometimes' },
  { value: 5, label: 'I code regularly' },
]

const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'Go',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'R', 'Other',
]

const FRAMEWORKS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Django', 'FastAPI',
  'Flask', 'Express', 'Spring', 'Rails', '.NET', 'Laravel',
]

const AI_TOOLS = [
  'Claude Code', 'Cursor', 'GitHub Copilot', 'ChatGPT', 'Windsurf',
  'Replit Agent', 'v0', 'Bolt', 'Lovable', 'None yet',
]

const INTERESTS = [
  'SaaS Product', 'Portfolio / Personal Site', 'Learn to Code',
  'Automation & Scripts', 'Mobile App', 'Internal Tool',
  'E-Commerce', 'API / Backend Service', 'Other',
]

function toggleInList(list, item) {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item]
}

function SectionLabel({ children }) {
  return <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{children}</label>
}

function ReadonlyNote({ children }) {
  return <p className="text-xs text-[#9B9B9B] mt-1.5">{children}</p>
}

export default function Settings() {
  const { user, profile, loading: userLoading, setUserData } = useUser()
  const navigate = useNavigate()

  useBreadcrumbs([{ label: 'Settings' }])

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [codingComfort, setCodingComfort] = useState(1)
  const [languages, setLanguages] = useState([])
  const [frameworks, setFrameworks] = useState([])
  const [aiTools, setAiTools] = useState([])
  const [interests, setInterests] = useState([])

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userLoading) return
    if (!user) { navigate('/onboarding'); return }
    setName(user.name || '')
    setRole(user.role || '')
    if (profile) {
      setCodingComfort(Math.max(1, (profile.general_coding_comfort || 0) + 1))
      setLanguages(profile.known_languages || [])
      setFrameworks(profile.known_frameworks || [])
      setAiTools(profile.ai_tools || [])
      setInterests(profile.project_interests || [])
    }
  }, [user, profile, userLoading, navigate])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updates = {
        general_coding_comfort: Math.max(0, codingComfort - 1),
        known_languages: languages,
        known_frameworks: frameworks,
        ai_tools: aiTools,
        project_interests: interests,
      }
      const data = await updateUserProfile(user.id, updates)
      setUserData(data.user, data.profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#2A5FE6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Settings</h1>
          <p className="text-[#6B6B6B] mt-1">Update your profile and preferences.</p>
        </div>

        {/* Name */}
        <section>
          <SectionLabel>Name</SectionLabel>
          <input
            type="text"
            value={name}
            disabled
            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-sm text-[#9B9B9B] cursor-not-allowed"
          />
          <ReadonlyNote>Name cannot be changed after onboarding.</ReadonlyNote>
        </section>

        {/* Role */}
        <section>
          <SectionLabel>Role</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <SelectCard
                key={r.value}
                label={r.label}
                selected={role === r.value}
                onClick={() => {}}
              />
            ))}
          </div>
          <ReadonlyNote>Role cannot be changed after onboarding.</ReadonlyNote>
        </section>

        {/* Coding comfort */}
        <section>
          <SectionLabel>Coding comfort</SectionLabel>
          <div className="space-y-2">
            {CODING_LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setCodingComfort(l.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer
                  ${
                    codingComfort === l.value
                      ? 'border-[#2A5FE6] bg-[#F0F5FF] text-[#2A5FE6]'
                      : 'border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#D4D4D4] hover:bg-[#F5F5F5]'
                  }`}
              >
                <span className="text-[#9B9B9B] mr-3">{l.value}</span>
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section>
          <SectionLabel>Languages</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <SelectCard
                key={l}
                label={l}
                selected={languages.includes(l)}
                onClick={() => setLanguages(toggleInList(languages, l))}
              />
            ))}
          </div>
        </section>

        {/* Frameworks */}
        <section>
          <SectionLabel>Frameworks</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {FRAMEWORKS.map((f) => (
              <SelectCard
                key={f}
                label={f}
                selected={frameworks.includes(f)}
                onClick={() => setFrameworks(toggleInList(frameworks, f))}
              />
            ))}
          </div>
        </section>

        {/* AI Tools */}
        <section>
          <SectionLabel>AI tools</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.map((t) => (
              <SelectCard
                key={t}
                label={t}
                selected={aiTools.includes(t)}
                onClick={() => setAiTools(toggleInList(aiTools, t))}
              />
            ))}
          </div>
        </section>

        {/* Interests */}
        <section>
          <SectionLabel>Interests</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INTERESTS.map((i) => (
              <SelectCard
                key={i}
                label={i}
                selected={interests.includes(i)}
                onClick={() => setInterests(toggleInList(interests, i))}
              />
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-4 pt-2 pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#2A5FE6] hover:bg-[#1E4FCC] text-white rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-[#16A34A] font-medium">Changes saved!</span>}
          {error && <span className="text-sm text-[#DC2626]">{error}</span>}
        </div>
      </main>
    </div>
  )
}
