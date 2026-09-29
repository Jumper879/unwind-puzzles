import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[28px] border border-[var(--color-surface-outline)] bg-[var(--color-surface)] shadow-[0_10px_24px_var(--color-shadow)] ${className}`}
      {...props}
    />
  )
}
