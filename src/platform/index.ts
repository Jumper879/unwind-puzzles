import { createBrowserAdapter } from './browser'
import { createTelegramAdapter } from './telegram'
import type { PlatformAdapter } from './types'

export type { PlatformAdapter, PlatformSession, ThemeMode } from './types'

/**
 * A Telegram WebView always injects `window.Telegram.WebApp`, but that
 * object exists even when the page is just opened in a normal browser tab
 * from a t.me link preview — the reliable signal that we're actually
 * running as a Mini App is a non-empty, still-current `initData` string.
 */
export function detectPlatform(): PlatformAdapter {
  const tg = window.Telegram?.WebApp
  if (tg && typeof tg.initData === 'string' && tg.initData.length > 0) {
    tg.ready()
    tg.expand()
    return createTelegramAdapter(tg)
  }
  return createBrowserAdapter()
}
