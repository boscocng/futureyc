import { useOnboarding } from '../../contexts/OnboardingContext'
import StepShell from '../StepShell'
import SelectCard from '../SelectCard'

const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'Go',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'R', 'Other',
]

const FRAMEWORKS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Django', 'FastAPI',
  'Flask', 'Express', 'Spring', 'Rails', '.NET', 'Laravel',
]

export default function StepToolkit() {
  const { state, dispatch } = useOnboarding()

  const toggle = (field, value) =>
    dispatch({ type: 'TOGGLE_IN_LIST', field, value })

  return (
    <StepShell
      step={3}
      title="What's in your toolkit?"
      subtitle="Select any languages and frameworks you've used. Zero is fine!"
      canNext
      onNext={() => dispatch({ type: 'NEXT_STEP' })}
      onPrev={() => dispatch({ type: 'PREV_STEP' })}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <SelectCard
                key={l}
                label={l}
                selected={state.languages.includes(l)}
                onClick={() => toggle('languages', l)}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Frameworks</h3>
          <div className="flex flex-wrap gap-2">
            {FRAMEWORKS.map((f) => (
              <SelectCard
                key={f}
                label={f}
                selected={state.frameworks.includes(f)}
                onClick={() => toggle('frameworks', f)}
              />
            ))}
          </div>
        </div>
      </div>
    </StepShell>
  )
}
