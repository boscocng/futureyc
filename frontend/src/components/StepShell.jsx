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
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col">
      <div className="w-full max-w-2xl mx-auto px-6 pt-8">
        <ProgressBar current={step} total={TOTAL_STEPS} />
        <p className="text-xs text-[#9B9B9B] mt-2 text-right">
          {step + 1} / {TOTAL_STEPS}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1A1A1A]">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-[#6B6B6B] text-lg">{subtitle}</p>
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
            className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-150 cursor-pointer"
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
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
            ${
              canNext
                ? 'bg-[#2A5FE6] hover:bg-[#1E4FCC] text-white'
                : 'bg-[#F5F5F5] text-[#9B9B9B] cursor-not-allowed'
            }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
