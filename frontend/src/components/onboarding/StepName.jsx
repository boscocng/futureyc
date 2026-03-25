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
        className="w-full bg-white border border-[#D4D4D4] rounded-lg px-4 py-3 text-lg text-[#1A1A1A] placeholder-[#9B9B9B] focus:outline-none focus:border-[#2A5FE6] focus:ring-1 focus:ring-[#2A5FE6]/20 transition-colors duration-150"
      />
    </StepShell>
  )
}
