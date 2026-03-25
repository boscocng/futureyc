import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

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

export default function ProjectCard({ project }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/project/${project.id}`)}
      className="w-full text-left p-6 rounded-xl border border-[#E5E5E5] bg-white transition-all duration-150 cursor-pointer group"
      style={{ boxShadow: 'none' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-[#1A1A1A] truncate">
          {project.name}
        </h3>
        <StatusBadge status={project.status} />
      </div>

      {project.scope_summary ? (
        <p className="text-sm text-[#6B6B6B] line-clamp-2 mb-4 leading-relaxed">
          {project.scope_summary}
        </p>
      ) : (
        <p className="text-sm text-[#9B9B9B] italic mb-4">No scope defined yet</p>
      )}

      <div className="flex items-center justify-between text-xs text-[#9B9B9B]">
        <span>
          {project.task_count} {project.task_count === 1 ? 'task' : 'tasks'}
        </span>
        <span>Updated {timeAgo(project.updated_at)}</span>
      </div>
    </button>
  )
}
