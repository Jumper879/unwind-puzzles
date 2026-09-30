import { create } from 'zustand'
import { setSoundEnabledGetter } from '../lib/sound'

export type ThemePreference = 'light' | 'dark' | 'system'

const THEME_KEY = 'unwind:theme'
const SOUND_KEY = 'unwind:sound-enabled'

function loadInitialSoundEnabled(): boolean {
  const stored = localStorage.getItem(SOUND_KEY)
  return stored === null ? true : stored === 'true'
}

function applyTheme(pref: ThemePreference) {
  const root = document.documentElement
  if (pref === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref)
}

function loadInitialTheme(): ThemePreference {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

interface UiState {
  drawerOpen: boolean
  openDrawer(): void
  closeDrawer(): void
  toggleDrawer(): void

  theme: ThemePreference
  setTheme(pref: ThemePreference): void

  soundEnabled: boolean
  setSoundEnabled(enabled: boolean): void
}

const initialTheme = loadInitialTheme()
if (typeof document !== 'undefined') applyTheme(initialTheme)

export const useUiStore = create<UiState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

  theme: initialTheme,
  setTheme: (pref) => {
    localStorage.setItem(THEME_KEY, pref)
    applyTheme(pref)
    set({ theme: pref })
  },

  soundEnabled: loadInitialSoundEnabled(),
  setSoundEnabled: (enabled) => {
    localStorage.setItem(SOUND_KEY, String(enabled))
    set({ soundEnabled: enabled })
  },
}))

setSoundEnabledGetter(() => useUiStore.getState().soundEnabled)
