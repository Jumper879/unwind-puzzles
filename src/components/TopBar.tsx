import type { ReactNode } from 'react'
import { useUiStore } from '../state/useUiStore'

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M2 5h16M2 10h16M2 15h16"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Shared top bar: hamburger (always opens the real drawer) + optional center/right slots. */
export function TopBar({ center, right }: { center?: ReactNode; right?: ReactNode }) {
  const openDrawer = useUiStore((s) => s.openDrawer)

  return (
    <div className="flex items-center justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[0_6px_14px_var(--color-shadow)] active:scale-95"
      >
        <HamburgerIcon />
      </button>
      <div className="flex-1 text-center">{center}</div>
      <div className="flex h-11 w-11 items-center justify-center">{right}</div>
    </div>
  )
}
