import { describe, expect, it, beforeEach } from 'vitest'
import { useSessionStore } from './useSessionStore'

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ session: null, status: 'idle' })
  })

  it('starts idle with no session', () => {
    expect(useSessionStore.getState().status).toBe('idle')
    expect(useSessionStore.getState().session).toBeNull()
  })

  it('setSession marks status ready', () => {
    useSessionStore.getState().setSession({ id: 'abc', isGuest: true, displayName: null })
    expect(useSessionStore.getState().status).toBe('ready')
    expect(useSessionStore.getState().session?.id).toBe('abc')
  })
})
