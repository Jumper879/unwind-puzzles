import { create } from 'zustand'

export interface ActiveRoundInfo {
  hasSaveSupport: boolean
}

interface ActiveRoundState {
  active: ActiveRoundInfo | null
  register: (info: ActiveRoundInfo) => void
  clear: () => void
}

/**
 * A game page registers here while a round is genuinely in progress
 * (mid-puzzle, not on its setup/result screen), and clears it on leaving
 * that phase or unmounting. BottomNav reads this to decide, when Back/Home
 * is pressed from a game: nothing registered -> just navigate; registered
 * with hasSaveSupport -> toast and navigate (nothing to lose); registered
 * without -> ask first. No game had any save/resume system before this —
 * every game registers hasSaveSupport: false except X&O, which now has a
 * minimal real one (see tic-tac-toe/resume.ts).
 */
export const useActiveRoundStore = create<ActiveRoundState>((set) => ({
  active: null,
  register: (info) => set({ active: info }),
  clear: () => set({ active: null }),
}))
