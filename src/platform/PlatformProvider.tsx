import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { detectPlatform, type PlatformAdapter } from './index'

const PlatformContext = createContext<PlatformAdapter | null>(null)

export function PlatformProvider({ children }: { children: ReactNode }) {
  const platform = useMemo(() => detectPlatform(), [])
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>
}

export function usePlatform(): PlatformAdapter {
  const ctx = useContext(PlatformContext)
  if (!ctx) throw new Error('usePlatform() must be used within <PlatformProvider>')
  return ctx
}
