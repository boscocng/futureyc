export default function SelectCard({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer text-left
        ${
          selected
            ? 'border-[#2A5FE6] bg-[#F0F5FF] text-[#2A5FE6]'
            : 'border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#D4D4D4] hover:bg-[#F5F5F5]'
        }`}
    >
      {label}
    </button>
  )
}
