import type { HTMLAttributes } from 'react'

/** The ref-home.png "neo-brutalist" card: 2.5px navy outline, hard 4px shadow (no blur). Scoped to Home. */
export function BrutalCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[14px] border-[2.5px] border-[var(--home-ink)] bg-[var(--home-surface)] shadow-[4px_4px_0_var(--home-shadow)] ${className}`}
      {...props}
    />
  )
}
