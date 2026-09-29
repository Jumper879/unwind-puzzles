import type { ReactNode } from 'react'
import { Mascot } from '../mascot/Mascot'
import { SpeechBubble } from './SpeechBubble'
import type { MascotMood } from '../mascot/types'

export function EmptyState({
  mood = 'encouraging',
  title,
  message,
  action,
}: {
  mood?: MascotMood
  title: string
  message?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <Mascot mood={mood} size={100} />
      <SpeechBubble>
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          {title}
        </p>
      </SpeechBubble>
      {message && <p className="max-w-xs text-sm text-[var(--color-text-secondary)]">{message}</p>}
      {action}
    </div>
  )
}
