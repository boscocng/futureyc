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
      className="w-full text-left p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-zinc-100 group-hover:text-white truncate">
          {project.name}
        </h3>
        <StatusBadge status={project.status} />
      </div>

      {project.scope_summary ? (
        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
          {project.scope_summary}
        </p>
      ) : (
        <p className="text-sm text-zinc-600 italic mb-4">No scope defined yet</p>
      )}

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          {project.task_count} {project.task_count === 1 ? 'task' : 'tasks'}
        </span>
        <span>Updated {timeAgo(project.updated_at)}</span>
      </div>
    </button>
  )
}
