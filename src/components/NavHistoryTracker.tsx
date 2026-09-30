import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavHistoryStore } from '../state/useNavHistoryStore'
import { bumpMaxIdx, getHistoryIdx, getOrInitBaselineIdx } from '../lib/navHistory'

/** Mounted once inside BrowserRouter — keeps useNavHistoryStore in sync with React Router's own history on every navigation (push, pop/back-forward, or a phone back gesture — they all move the same index). Renders nothing. */
export function NavHistoryTracker() {
  const location = useLocation()
  const setAvailability = useNavHistoryStore((s) => s.setAvailability)

  useEffect(() => {
    const baseline = getOrInitBaselineIdx()
    const idx = getHistoryIdx()
    const max = bumpMaxIdx(idx)
    setAvailability(idx > baseline, idx < max)
  }, [location, setAvailability])

  return null
}
