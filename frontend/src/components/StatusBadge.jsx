const styles = {
  // project statuses
  interviewing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  // task statuses
  defining: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  planned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  prompt_ready: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const labels = {
  prompt_ready: 'ready',
  in_progress: 'in progress',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.archived}`}
    >
      {labels[status] || status}
    </span>
  )
}
