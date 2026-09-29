import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { PlatformAdapter, PlatformSession, ThemeMode } from './types'

const GUEST_ID_KEY = 'unwind:guest-id'

function getOrCreateGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(GUEST_ID_KEY, id)
  }
  return id
}

/**
 * Browser/PWA implementation. When a Supabase project is configured (see
 * .env.example), identity is a real anonymous-auth session whose id is a
 * stable Supabase user id — progress/scores can sync once the rest of
 * Phase 2 lands. With no project configured yet, it degrades to a
 * localStorage-only guest id so local dev keeps working either way.
 */
export function createBrowserAdapter(): PlatformAdapter {
  return {
    kind: 'browser',

    identity: {
      async getSession(): Promise<PlatformSession | null> {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession()
          const user = data.session?.user
          if (!user) return null
          return { id: user.id, isGuest: user.is_anonymous ?? true, displayName: null }
        }
        const id = localStorage.getItem(GUEST_ID_KEY)
        if (!id) return null
        return { id, isGuest: true, displayName: null }
      },
      async signInGuest(): Promise<PlatformSession> {
        if (isSupabaseConfigured && supabase) {
          const existing = await this.getSession()
          if (existing) return existing
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error || !data.user) {
            throw new Error(error?.message ?? 'anonymous sign-in failed')
          }
          return { id: data.user.id, isGuest: true, displayName: null }
        }
        return { id: getOrCreateGuestId(), isGuest: true, displayName: null }
      },
    },

    chrome: {
      setBackButton() {
        // The browser has its own back button (and our UI shows one where needed).
      },
    },

    haptics: {
      impact(style) {
        if (!('vibrate' in navigator)) return
        const ms = style === 'heavy' ? 30 : style === 'medium' ? 18 : 10
        navigator.vibrate(ms)
      },
      notification(type) {
        if (!('vibrate' in navigator)) return
        navigator.vibrate(type === 'error' ? [20, 40, 20] : 15)
      },
    },

    theme: {
      getPreferred(): ThemeMode {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      },
      onChange(cb) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => cb(mq.matches ? 'dark' : 'light')
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
      },
    },

    viewport: {
      getSafeAreaInsets() {
        const style = getComputedStyle(document.documentElement)
        const read = (name: string) => parseInt(style.getPropertyValue(name) || '0', 10) || 0
        return {
          top: read('--sat'),
          bottom: read('--sab'),
          left: read('--sal'),
          right: read('--sar'),
        }
      },
      async requestFullscreen() {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => undefined)
        }
      },
    },

    gestures: {
      disableVerticalSwipes() {
        document.body.style.overscrollBehaviorY = 'contain'
      },
      enableVerticalSwipes() {
        document.body.style.overscrollBehaviorY = ''
      },
    },

    share: {
      async share(payload) {
        if (navigator.share) {
          await navigator.share(payload).catch(() => undefined)
        } else if (payload.url) {
          await navigator.clipboard.writeText(payload.url).catch(() => undefined)
        }
      },
    },

    install: {
      canPromptInstall() {
        return Boolean(deferredInstallPrompt)
      },
      async promptInstall() {
        if (!deferredInstallPrompt) return
        await deferredInstallPrompt.prompt()
        deferredInstallPrompt = null
      },
    },
  }
}

// `beforeinstallprompt` fires long before any component that wants to offer
// an install button mounts, so we capture it once at module load.
let deferredInstallPrompt: { prompt(): Promise<void> } | null = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstallPrompt = e as unknown as { prompt(): Promise<void> }
  })
}
