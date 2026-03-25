import { useState } from 'react'

export default function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    await onCreate(name.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        className="relative bg-white border border-[#E5E5E5] rounded-2xl p-8 w-full max-w-md mx-4"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
      >
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">New Project</h2>
        <p className="text-sm text-[#6B6B6B] mb-6">
          Give your project a name. You can change it later.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome project"
            autoFocus
            className="w-full bg-white border border-[#D4D4D4] rounded-lg px-4 py-3 text-[#1A1A1A] placeholder-[#9B9B9B] focus:outline-none focus:border-[#2A5FE6] focus:ring-1 focus:ring-[#2A5FE6]/20 transition-colors duration-150 mb-6"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                ${
                  name.trim() && !submitting
                    ? 'bg-[#2A5FE6] hover:bg-[#1E4FCC] text-white'
                    : 'bg-[#F5F5F5] text-[#9B9B9B] cursor-not-allowed'
                }`}
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
