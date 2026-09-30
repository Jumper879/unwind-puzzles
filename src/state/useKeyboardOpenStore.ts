import { create } from 'zustand'

interface KeyboardOpenState {
  customKeyboardOpen: boolean
  setCustomKeyboardOpen: (open: boolean) => void
}

/**
 * For on-screen keyboards BottomNav can't detect on its own — a native
 * text input focusing is detected generically (see BottomNav's own
 * focusin/focusout listener), but Crossword's keyboard is a custom
 * component, not a real input, so it sets this explicitly while visible.
 */
export const useKeyboardOpenStore = create<KeyboardOpenState>((set) => ({
  customKeyboardOpen: false,
  setCustomKeyboardOpen: (open) => set({ customKeyboardOpen: open }),
}))
