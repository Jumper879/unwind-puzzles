import { create } from 'zustand'
import type { PlatformSession } from '../platform/types'

interface SessionState {
  session: PlatformSession | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  setSession(session: PlatformSession): void
  setStatus(status: SessionState['status']): void
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  status: 'idle',
  setSession: (session) => set({ session, status: 'ready' }),
  setStatus: (status) => set({ status }),
}))
