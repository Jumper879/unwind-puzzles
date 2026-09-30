import { create } from 'zustand'

interface NavHistoryState {
  canGoBack: boolean
  canGoForward: boolean
  setAvailability: (canGoBack: boolean, canGoForward: boolean) => void
}

/** Back/Forward button availability — kept in sync with the real browser history by NavHistoryTracker, never a separate fake stack. */
export const useNavHistoryStore = create<NavHistoryState>((set) => ({
  canGoBack: false,
  canGoForward: false,
  setAvailability: (canGoBack, canGoForward) => set({ canGoBack, canGoForward }),
}))
