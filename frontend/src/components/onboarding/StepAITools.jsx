import { useOnboarding } from '../../contexts/OnboardingContext'
import StepShell from '../StepShell'
import SelectCard from '../SelectCard'

const AI_TOOLS = [
  'Claude Code', 'Cursor', 'GitHub Copilot', 'ChatGPT', 'Windsurf',
  'Replit Agent', 'v0', 'Bolt', 'Lovable', 'None yet',
]

export default function StepAITools() {
  const { state, dispatch } = useOnboarding()

  return (
    <StepShell
      step={4}
      title="Which AI tools do you use?"
      subtitle="Select all that apply."
      canNext
      onNext={() => dispatch({ type: 'NEXT_STEP' })}
      onPrev={() => dispatch({ type: 'PREV_STEP' })}
    >
      <div className="flex flex-wrap gap-2">
        {AI_TOOLS.map((tool) => (
          <SelectCard
            key={tool}
            label={tool}
            selected={state.ai_tools.includes(tool)}
            onClick={() =>
              dispatch({ type: 'TOGGLE_IN_LIST', field: 'ai_tools', value: tool })
            }
          />
        ))}
      </div>
    </StepShell>
  )
}
