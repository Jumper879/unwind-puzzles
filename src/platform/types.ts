export type ThemeMode = 'light' | 'dark'

export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

export interface PlatformSession {
  id: string
  isGuest: boolean
  displayName: string | null
}

export type HapticImpactStyle = 'light' | 'medium' | 'heavy'
export type HapticNotificationType = 'success' | 'warning' | 'error'

/**
 * Everything a game or screen needs from "the platform we're running on".
 * Games never touch window.Telegram or browser-only APIs directly — they
 * only ever see this interface, so the same game code runs unmodified in
 * the browser, as an installed PWA, or inside Telegram.
 */
export interface PlatformAdapter {
  readonly kind: 'browser' | 'telegram'

  identity: {
    getSession(): Promise<PlatformSession | null>
    signInGuest(): Promise<PlatformSession>
  }

  chrome: {
    /** Show/hide a back control and wire its handler. No-ops on platforms without one (falls back to in-app UI). */
    setBackButton(visible: boolean, onClick?: () => void): void
  }

  haptics: {
    impact(style: HapticImpactStyle): void
    notification(type: HapticNotificationType): void
  }

  theme: {
    /** Theme the *platform chrome* wants (Telegram theme, OS scheme). The app's own manual toggle can still override this. */
    getPreferred(): ThemeMode
    onChange(cb: (mode: ThemeMode) => void): () => void
  }

  viewport: {
    getSafeAreaInsets(): SafeAreaInsets
    requestFullscreen(): Promise<void>
  }

  gestures: {
    disableVerticalSwipes(): void
    enableVerticalSwipes(): void
  }

  share: {
    share(payload: { title: string; text?: string; url?: string }): Promise<void>
  }

  install: {
    canPromptInstall(): boolean
    promptInstall(): Promise<void>
  }
}
