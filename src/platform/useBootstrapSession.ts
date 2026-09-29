import { useEffect } from 'react'
import { usePlatform } from './PlatformProvider'
import { useSessionStore } from '../state/useSessionStore'

/**
 * Ensures a session exists (existing one, or a fresh guest) once per app
 * load. Call this once near the root, inside <PlatformProvider>.
 */
export function useBootstrapSession() {
  const platform = usePlatform()
  const status = useSessionStore((s) => s.status)
  const setSession = useSessionStore((s) => s.setSession)
  const setStatus = useSessionStore((s) => s.setStatus)

  useEffect(() => {
    if (status !== 'idle') return
    setStatus('loading')
    ;(async () => {
      try {
        const existing = await platform.identity.getSession()
        const session = existing ?? (await platform.identity.signInGuest())
        setSession(session)
      } catch (err) {
        console.error('[unwind] session bootstrap failed', err)
        setStatus('error')
      }
    })()
  }, [platform, status, setSession, setStatus])
}
