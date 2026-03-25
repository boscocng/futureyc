import { useOnboarding } from '../../contexts/OnboardingContext'
import StepShell from '../StepShell'

const LEVELS = [
  { value: 1, label: 'Never coded' },
  { value: 2, label: "I've copy-pasted some code" },
  { value: 3, label: 'I can follow tutorials' },
  { value: 4, label: 'I build things sometimes' },
  { value: 5, label: 'I code regularly' },
]

export default function StepCoding() {
  const { state, dispatch } = useOnboarding()

  return (
    <StepShell
      step={2}
      title="How comfortable are you with coding?"
      subtitle="Be honest — there's no wrong answer."
      canNext
      onNext={() => dispatch({ type: 'NEXT_STEP' })}
      onPrev={() => dispatch({ type: 'PREV_STEP' })}
    >
      <div className="space-y-2">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() =>
              dispatch({
                type: 'SET_FIELD',
                field: 'coding_comfort',
                value: l.value,
              })
            }
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer
              ${
                state.coding_comfort === l.value
                  ? 'border-[#2A5FE6] bg-[#F0F5FF] text-[#2A5FE6]'
                  : 'border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#D4D4D4] hover:bg-[#F5F5F5]'
              }`}
          >
            <span className="text-[#9B9B9B] mr-3">{l.value}</span>
            {l.label}
          </button>
        ))}
      </div>
    </StepShell>
  )
}
