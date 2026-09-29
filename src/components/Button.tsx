import { motion, useReducedMotion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'surface' | 'chrome'

// Framer Motion's motion.button has its own (incompatible) signatures for
// onDrag*/onAnimation* — omit those from the native HTML props we forward.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>

interface ButtonProps extends NativeButtonProps {
  variant?: Variant
  icon?: ReactNode
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white shadow-[inset_0_2px_0_rgb(255_255_255_/_35%),0_8px_18px_var(--color-shadow)]',
  surface:
    'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-surface-outline)] shadow-[inset_0_2px_0_rgb(255_255_255_/_70%),0_8px_18px_var(--color-shadow)]',
  chrome:
    'bg-[var(--navy-800)] text-white shadow-[inset_0_2px_0_rgb(255_255_255_/_10%),0_8px_18px_rgb(0_0_0_/_30%)]',
}

/** Pillowy, raised buttons with a satisfying press — the "clay" material language from the reference boards. */
export function Button({
  variant = 'surface',
  icon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.button
      className={`inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-3 font-[var(--font-heading)] font-bold transition-opacity disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      whileTap={reduceMotion ? { opacity: 0.85 } : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      {...props}
    >
      {icon}
      {children}
    </motion.button>
  )
}
