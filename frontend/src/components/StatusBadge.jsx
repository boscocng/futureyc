const styles = {
  // project statuses
  interviewing: 'bg-[#FEF9C3] text-[#A16207] border-[#FDE68A]',
  active:       'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  archived:     'bg-[#F5F5F5] text-[#9B9B9B] border-[#E5E5E5]',
  // task statuses
  defining:     'bg-[#FEF9C3] text-[#A16207] border-[#FDE68A]',
  planned:      'bg-[#EEF2FF] text-[#2A5FE6] border-[#C7D7FC]',
  prompt_ready: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  in_progress:  'bg-[#EEF2FF] text-[#2A5FE6] border-[#C7D7FC]',
  done:         'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
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
