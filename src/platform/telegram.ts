import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { PlatformAdapter, PlatformSession, ThemeMode } from './types'
import type { TelegramWebApp } from './telegram-webapp.d.ts'

function cosmeticSessionFromInitDataUnsafe(tg: TelegramWebApp): PlatformSession | null {
  // initDataUnsafe is NOT trusted for anything that matters (scores,
  // writes) — only ever used for a display name, and only as a fallback
  // when no Supabase project is configured yet (see .env.example).
  const user = (tg.initDataUnsafe as { user?: { id?: number; first_name?: string } })?.user
  if (!user?.id) return null
  return { id: String(user.id), isGuest: true, displayName: user.first_name ?? null }
}

/**
 * Telegram Mini App implementation. `safeAreaInset`, `requestFullscreen`,
 * `addToHomeScreen` and `disableVerticalSwipes` are gated to Bot API
 * 7.7+/8.0+ per current docs (core.telegram.org/bots/webapps) — every call
 * below feature-detects rather than assuming presence, since older
 * Telegram clients won't have them.
 */
export function createTelegramAdapter(tg: TelegramWebApp): PlatformAdapter {
  return {
    kind: 'telegram',

    identity: {
      async getSession(): Promise<PlatformSession | null> {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession()
          const user = data.session?.user
          if (user) return { id: user.id, isGuest: false, displayName: null }
          return null
        }
        return cosmeticSessionFromInitDataUnsafe(tg)
      },
      async signInGuest(): Promise<PlatformSession> {
        const existing = await this.getSession()
        if (existing) return existing

        if (isSupabaseConfigured && supabase) {
          // The real, server-validated path: initData is verified against
          // the bot token in the telegram-auth Edge Function (HMAC-SHA256,
          // per core.telegram.org/bots/webapps), which hands back a real
          // Supabase session — see that function's header comment.
          const { data, error } = await supabase.functions.invoke<{
            access_token: string
            refresh_token: string
          }>('telegram-auth', { body: { initData: tg.initData } })
          if (error || !data) {
            throw new Error(error?.message ?? 'telegram-auth failed')
          }
          const { error: setErr } = await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          })
          if (setErr) throw setErr
          const displayName =
            (tg.initDataUnsafe as { user?: { first_name?: string } })?.user?.first_name ?? null
          const { data: sessionData } = await supabase.auth.getSession()
          const userId = sessionData.session?.user.id
          if (!userId) throw new Error('no session after telegram-auth')
          return { id: userId, isGuest: false, displayName }
        }

        return (
          cosmeticSessionFromInitDataUnsafe(tg) ?? {
            id: 'telegram-unknown',
            isGuest: true,
            displayName: null,
          }
        )
      },
    },

    chrome: {
      setBackButton(visible, onClick) {
        if (visible) {
          if (onClick) tg.BackButton.onClick(onClick)
          tg.BackButton.show()
        } else {
          tg.BackButton.hide()
        }
      },
    },

    haptics: {
      impact(style) {
        tg.HapticFeedback.impactOccurred(style)
      },
      notification(type) {
        tg.HapticFeedback.notificationOccurred(type)
      },
    },

    theme: {
      getPreferred(): ThemeMode {
        return tg.colorScheme === 'dark' ? 'dark' : 'light'
      },
      onChange(cb) {
        const handler = () => cb(tg.colorScheme === 'dark' ? 'dark' : 'light')
        tg.onEvent('themeChanged', handler)
        return () => tg.offEvent('themeChanged', handler)
      },
    },

    viewport: {
      getSafeAreaInsets() {
        const inset = tg.safeAreaInset
        return {
          top: inset?.top ?? 0,
          bottom: inset?.bottom ?? 0,
          left: inset?.left ?? 0,
          right: inset?.right ?? 0,
        }
      },
      async requestFullscreen() {
        tg.requestFullscreen?.()
      },
    },

    gestures: {
      disableVerticalSwipes() {
        tg.disableVerticalSwipes?.()
      },
      enableVerticalSwipes() {
        tg.enableVerticalSwipes?.()
      },
    },

    share: {
      async share(payload) {
        if (payload.url) {
          const text = payload.text ? `&text=${encodeURIComponent(payload.text)}` : ''
          window.open(
            `https://t.me/share/url?url=${encodeURIComponent(payload.url)}${text}`,
            '_blank',
          )
        }
      },
    },

    install: {
      canPromptInstall() {
        return typeof tg.addToHomeScreen === 'function'
      },
      async promptInstall() {
        tg.addToHomeScreen?.()
      },
    },
  }
}
