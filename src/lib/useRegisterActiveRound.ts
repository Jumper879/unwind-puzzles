import { useEffect } from 'react'
import { useActiveRoundStore } from '../state/useActiveRoundStore'

/** One-line hook each game page calls with `isActive = phase === 'playing'` (or equivalent) so BottomNav knows whether Back/Home is leaving a live round. */
export function useRegisterActiveRound(isActive: boolean, hasSaveSupport: boolean): void {
  const register = useActiveRoundStore((s) => s.register)
  const clear = useActiveRoundStore((s) => s.clear)

  useEffect(() => {
    if (!isActive) {
      clear()
      return
    }
    register({ hasSaveSupport })
    return clear
  }, [isActive, hasSaveSupport, register, clear])
}
