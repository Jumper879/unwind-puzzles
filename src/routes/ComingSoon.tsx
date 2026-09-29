import { Link } from 'react-router-dom'
import { Mascot } from '../mascot/Mascot'
import { SpeechBubble } from '../components/SpeechBubble'
import { Button } from '../components/Button'

export function ComingSoon({
  title,
  phase,
  message,
}: {
  title: string
  phase?: number
  message?: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <Mascot mood="thinking" size={110} />
      <SpeechBubble>
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          {title}
        </p>
      </SpeechBubble>
      <p className="max-w-xs text-[var(--color-text-secondary)]">
        {message ?? (phase ? `Coming in Phase ${phase} of the build.` : 'This is coming soon.')}
      </p>
      <Link to="/">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  )
}
