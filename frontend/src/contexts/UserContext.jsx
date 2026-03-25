import { createContext, useContext, useState, useEffect } from 'react'
import { getUserProfile } from '../api/client'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      setLoading(false)
      return
    }
    getUserProfile(userId)
      .then((data) => {
        setUser(data.user)
        setProfile(data.profile)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function setUserData(userData, profileData) {
    setUser(userData)
    setProfile(profileData)
  }

  return (
    <UserContext.Provider value={{ user, profile, loading, setUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be inside UserProvider')
  return ctx
}
