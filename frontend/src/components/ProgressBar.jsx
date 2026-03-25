export default function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100
  return (
    <div className="w-full h-[3px] bg-[#E5E5E5] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#2A5FE6] rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
