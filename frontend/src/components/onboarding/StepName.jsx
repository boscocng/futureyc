import { useOnboarding } from '../../contexts/OnboardingContext'
import StepShell from '../StepShell'

export default function StepName() {
  const { state, dispatch } = useOnboarding()

  return (
    <StepShell
      step={0}
      title="What should we call you?"
      subtitle="This is how we'll address you in the app."
      canNext={state.name.trim().length > 0}
      onNext={() => dispatch({ type: 'NEXT_STEP' })}
    >
      <input
        type="text"
        value={state.name}
        onChange={(e) =>
          dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })
        }
        placeholder="Your name"
        autoFocus
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
      />
    </StepShell>
  )
}
