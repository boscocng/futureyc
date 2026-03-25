export default function SelectCard({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer
        ${
          selected
            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
            : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800'
        }`}
    >
      {label}
    </button>
  )
}
