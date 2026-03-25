import { createContext, useContext, useState, useEffect, useRef } from 'react'

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [crumbs, setCrumbs] = useState([])

  return (
    <NavContext.Provider value={{ crumbs, setCrumbs }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be inside NavProvider')
  return ctx
}

/**
 * Hook for pages to set breadcrumbs.
 * Call with an array of { label, to } objects.
 * Cleans up on unmount.
 */
export function useBreadcrumbs(crumbs) {
  const { setCrumbs } = useNav()
  const serialized = JSON.stringify(crumbs)
  const prev = useRef('')

  useEffect(() => {
    if (serialized !== prev.current) {
      prev.current = serialized
      setCrumbs(crumbs)
    }
    return () => setCrumbs([])
  }, [serialized, setCrumbs])
}
