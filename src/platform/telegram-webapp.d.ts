/**
 * Minimal typing for the subset of the Telegram Mini Apps client
 * (telegram-web-app.js) this app actually uses. Not exhaustive —
 * see https://core.telegram.org/bots/webapps for the full surface.
 */
export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
}

export interface TelegramSafeAreaInset {
  top: number
  bottom: number
  left: number
  right: number
}

export interface TelegramBackButton {
  isVisible: boolean
  show(): void
  hide(): void
  onClick(cb: () => void): void
  offClick(cb: () => void): void
}

export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
  notificationOccurred(type: 'error' | 'success' | 'warning'): void
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: Record<string, unknown>
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams
  safeAreaInset?: TelegramSafeAreaInset
  contentSafeAreaInset?: TelegramSafeAreaInset
  BackButton: TelegramBackButton
  HapticFeedback: TelegramHapticFeedback
  ready(): void
  expand(): void
  close(): void
  requestFullscreen?(): void
  disableVerticalSwipes?(): void
  enableVerticalSwipes?(): void
  addToHomeScreen?(): void
  onEvent(event: string, cb: () => void): void
  offEvent(event: string, cb: () => void): void
  shareToStory?(mediaUrl: string, params?: Record<string, unknown>): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}
