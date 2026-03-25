import { createContext, useContext, useReducer } from 'react'

const OnboardingContext = createContext(null)

const initialState = {
  step: 0,
  name: '',
  role: '',
  coding_comfort: 1,
  languages: [],
  frameworks: [],
  ai_tools: [],
  project_interests: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'TOGGLE_IN_LIST': {
      const list = state[action.field]
      const exists = list.includes(action.value)
      return {
        ...state,
        [action.field]: exists
          ? list.filter((v) => v !== action.value)
          : [...list, action.value],
      }
    }
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 }
    case 'PREV_STEP':
      return { ...state, step: Math.max(0, state.step - 1) }
    default:
      return state
  }
}

export function OnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be inside OnboardingProvider')
  return ctx
}
