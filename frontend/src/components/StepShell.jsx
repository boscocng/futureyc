import ProgressBar from './ProgressBar'

const TOTAL_STEPS = 6

export default function StepShell({
  step,
  title,
  subtitle,
  canNext = true,
  onNext,
  onPrev,
  nextLabel = 'Continue',
  children,
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="w-full max-w-2xl mx-auto px-6 pt-8">
        <ProgressBar current={step} total={TOTAL_STEPS} />
        <p className="text-xs text-zinc-500 mt-2 text-right">
          {step + 1} / {TOTAL_STEPS}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-zinc-400 text-lg">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-6 pb-10 flex justify-between items-center">
        {step > 0 ? (
          <button
            type="button"
            onClick={onPrev}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer
            ${
              canNext
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
