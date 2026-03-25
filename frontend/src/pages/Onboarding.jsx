import { OnboardingProvider, useOnboarding } from '../contexts/OnboardingContext'
import StepName from '../components/onboarding/StepName'
import StepRole from '../components/onboarding/StepRole'
import StepCoding from '../components/onboarding/StepCoding'
import StepToolkit from '../components/onboarding/StepToolkit'
import StepAITools from '../components/onboarding/StepAITools'
import StepInterests from '../components/onboarding/StepInterests'

const STEPS = [StepName, StepRole, StepCoding, StepToolkit, StepAITools, StepInterests]

function OnboardingFlow() {
  const { state } = useOnboarding()
  const StepComponent = STEPS[state.step]
  return <StepComponent />
}

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  )
}
