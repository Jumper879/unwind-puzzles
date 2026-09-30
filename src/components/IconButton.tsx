import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  bg?: string
}

/** The ref-home.png "neo-brutalist" icon button: 2.5px navy outline, hard 3px shadow, presses flat. Scoped to Home. */
export function IconButton({ icon, bg = 'var(--home-surface)', className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border-[2.5px] border-[var(--home-ink)] shadow-[3px_3px_0_var(--home-shadow)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_var(--home-shadow)] ${className}`}
      style={{ background: bg }}
      {...props}
    >
      {icon}
    </button>
  )
}
