import type { ReactNode } from 'react'

export function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <div className="relative inline-block rounded-[22px] border border-[var(--color-surface-outline)] bg-[var(--color-surface)] px-5 py-3 text-center shadow-[0_8px_18px_var(--color-shadow)]">
      {children}
      <span
        className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 border-b border-r border-[var(--color-surface-outline)] bg-[var(--color-surface)]"
        aria-hidden
      />
    </div>
  )
}
