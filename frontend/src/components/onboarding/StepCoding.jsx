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
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer
              ${
                state.coding_comfort === l.value
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800'
              }`}
          >
            <span className="text-zinc-500 mr-3">{l.value}</span>
            {l.label}
          </button>
        ))}
      </div>
    </StepShell>
  )
}
