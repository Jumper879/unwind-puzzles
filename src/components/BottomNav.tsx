import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNavHistoryStore } from '../state/useNavHistoryStore'
import { useActiveRoundStore } from '../state/useActiveRoundStore'
import { useKeyboardOpenStore } from '../state/useKeyboardOpenStore'
import { usePlatform } from '../platform/PlatformProvider'
import { getHistoryIdx, getOrInitBaselineIdx } from '../lib/navHistory'
import { ConfirmLeaveSheet } from './ConfirmLeaveSheet'
import { Toast } from './Toast'

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 5l-7 7 7 7" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ForwardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 5l7 7-7 7" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11.5L12 4l8 7.5M6 10v9h5v-5h2v5h5v-9"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NavButton({
  icon,
  label,
  onClick,
  disabled,
  filled,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  filled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border-[2.5px] border-[var(--home-ink)] shadow-[3px_3px_0_var(--home-shadow)] transition-transform duration-100 disabled:opacity-40 ${
        disabled ? '' : 'active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_var(--home-shadow)]'
      }`}
      style={{
        background: filled ? 'var(--blue-500)' : 'var(--home-surface)',
        color: filled ? '#ffffff' : 'var(--home-ink)',
      }}
    >
      {icon}
    </button>
  )
}

/**
 * Fixed bottom bar with Back/Home/Forward, shown on every screen except
 * Loading/Start (those render before this ever mounts — see App.tsx). Back
 * and Forward move React Router's own history (see lib/navHistory.ts) —
 * never a separate fake stack — so the phone's back gesture and the
 * browser's own buttons always agree with these arrows.
 */
export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const platform = usePlatform()
  const canGoBack = useNavHistoryStore((s) => s.canGoBack)
  const canGoForward = useNavHistoryStore((s) => s.canGoForward)
  const activeRound = useActiveRoundStore((s) => s.active)
  const customKeyboardOpen = useKeyboardOpenStore((s) => s.customKeyboardOpen)

  const [nativeInputFocused, setNativeInputFocused] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const pendingActionRef = useRef<(() => void) | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Native inputs (Home's search box) hide the bar the same way the OS
  // keyboard would cover it anyway; Crossword's on-screen keyboard isn't a
  // real input, so it signals through useKeyboardOpenStore instead.
  useEffect(() => {
    function isTextInput(target: EventTarget | null): boolean {
      return target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
    }
    function onFocusIn(e: FocusEvent) {
      if (isTextInput(e.target)) setNativeInputFocused(true)
    }
    function onFocusOut(e: FocusEvent) {
      if (isTextInput(e.target)) setNativeInputFocused(false)
    }
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
  }, [])

  function runWithLeaveCheck(action: () => void) {
    if (!activeRound) {
      action()
      return
    }
    if (activeRound.hasSaveSupport) {
      action()
      setToastVisible(true)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 2000)
      return
    }
    pendingActionRef.current = action
    setConfirmOpen(true)
  }

  function handleBack() {
    platform.haptics.impact('light')
    runWithLeaveCheck(() => {
      const idx = getHistoryIdx()
      const baseline = getOrInitBaselineIdx()
      // `replace` here (and in handleHome below) rather than a push: "give
      // up and land on Home" is conceptually the same one step whichever
      // button triggers it, not a new page to later Back away from — and
      // it keeps history.state.idx from climbing past the real max, so
      // Forward correctly goes back to being unavailable right after.
      if (idx > baseline) navigate(-1)
      else if (location.pathname !== '/') navigate('/', { replace: true })
    })
  }

  const backDisabled = !canGoBack && location.pathname === '/'

  // Telegram's own top BackButton mirrors this same Back logic (not a
  // second, independent implementation) — visible on every screen except
  // Home, exactly when our own Back button would be enabled.
  useEffect(() => {
    platform.chrome.setBackButton(!backDisabled, handleBack)
    return () => platform.chrome.setBackButton(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backDisabled, activeRound, canGoBack, location.pathname])

  function handleForward() {
    if (!canGoForward) return
    platform.haptics.impact('light')
    runWithLeaveCheck(() => navigate(1))
  }

  function handleHome() {
    platform.haptics.impact('light')
    runWithLeaveCheck(() => navigate('/', { replace: true }))
  }

  if (customKeyboardOpen || nativeInputFocused) return null

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-[70] mx-auto flex w-full max-w-[480px] items-center justify-around border-t-[2.5px] border-[var(--home-ink)] px-8"
        style={{
          background: 'var(--home-bg)',
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <NavButton icon={<BackIcon />} label="Go back" onClick={handleBack} disabled={backDisabled} />
        <NavButton icon={<HomeIcon />} label="Home" onClick={handleHome} filled />
        <NavButton icon={<ForwardIcon />} label="Go forward" onClick={handleForward} disabled={!canGoForward} />
      </nav>

      {confirmOpen && (
        <ConfirmLeaveSheet
          onLeave={() => {
            setConfirmOpen(false)
            pendingActionRef.current?.()
            pendingActionRef.current = null
          }}
          onKeepPlaying={() => {
            setConfirmOpen(false)
            pendingActionRef.current = null
          }}
        />
      )}

      <Toast message="Progress saved" visible={toastVisible} />
    </>
  )
}

/** Total space every page's content must clear so BottomNav never covers it — used once at the shared <main> level, see App.tsx. */
export const BOTTOM_NAV_CLEARANCE = 'calc(64px + env(safe-area-inset-bottom, 0px))'
