import { useState, useEffect, useRef } from 'react'
import { fetchHealth } from '../api/client'

export default function ConnectionBanner() {
  const [connected, setConnected] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        await fetchHealth()
        if (mounted) {
          setConnected(true)
          setRetrying(false)
        }
      } catch {
        if (mounted) {
          setConnected(false)
          setRetrying(true)
        }
      }
    }

    intervalRef.current = setInterval(check, 10000)

    return () => {
      mounted = false
      clearInterval(intervalRef.current)
    }
  }, [])

  if (connected) return null

  return (
    <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-6 py-2.5 flex items-center justify-center gap-2">
      {retrying && (
        <div className="h-3.5 w-3.5 border-2 border-[#E6930A] border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
      <p className="text-sm text-[#A16207] font-medium">
        Connection lost. Retrying...
      </p>
    </div>
  )
}
