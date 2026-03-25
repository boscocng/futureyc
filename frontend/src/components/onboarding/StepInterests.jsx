import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../contexts/OnboardingContext'
import { useUser } from '../../contexts/UserContext'
import { completeOnboarding } from '../../api/client'
import StepShell from '../StepShell'
import SelectCard from '../SelectCard'

const INTERESTS = [
  'SaaS Product',
  'Portfolio / Personal Site',
  'Learn to Code',
  'Automation & Scripts',
  'Mobile App',
  'Internal Tool',
  'E-Commerce',
  'API / Backend Service',
  'Other',
]

export default function StepInterests() {
  const { state, dispatch } = useOnboarding()
  const { setUserData } = useUser()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const { step, ...payload } = state
      const data = await completeOnboarding(payload)
      localStorage.setItem('user_id', data.user.id)
      setUserData(data.user, data.profile)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StepShell
      step={5}
      title="What do you want to build?"
      subtitle="Pick everything that interests you."
      canNext={!submitting}
      onNext={handleSubmit}
      onPrev={() => dispatch({ type: 'PREV_STEP' })}
      nextLabel={submitting ? 'Setting up...' : "Let's Go"}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INTERESTS.map((interest) => (
          <SelectCard
            key={interest}
            label={interest}
            selected={state.project_interests.includes(interest)}
            onClick={() =>
              dispatch({
                type: 'TOGGLE_IN_LIST',
                field: 'project_interests',
                value: interest,
              })
            }
          />
        ))}
      </div>
      {error && (
        <p className="text-[#DC2626] text-sm mt-4">{error}</p>
      )}
    </StepShell>
  )
}
