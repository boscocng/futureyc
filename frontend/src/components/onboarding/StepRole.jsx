import { useOnboarding } from '../../contexts/OnboardingContext'
import StepShell from '../StepShell'
import SelectCard from '../SelectCard'

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'educator', label: 'Educator' },
  { value: 'pm', label: 'Product Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'founder', label: 'Founder' },
  { value: 'other', label: 'Other' },
]

export default function StepRole() {
  const { state, dispatch } = useOnboarding()

  return (
    <StepShell
      step={1}
      title="What's your role?"
      subtitle="Helps us tailor the experience to you."
      canNext={state.role !== ''}
      onNext={() => dispatch({ type: 'NEXT_STEP' })}
      onPrev={() => dispatch({ type: 'PREV_STEP' })}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <SelectCard
            key={r.value}
            label={r.label}
            selected={state.role === r.value}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'role', value: r.value })
            }
          />
        ))}
      </div>
    </StepShell>
  )
}
