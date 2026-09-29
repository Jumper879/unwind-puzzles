import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { Button } from '../../../components/Button'
import type { ChessDifficulty } from '../engine/types'

const DIFFICULTIES: { value: ChessDifficulty; label: string; blurb: string }[] = [
  { value: 'easy', label: 'Easy', blurb: 'Relaxed, makes mistakes' },
  { value: 'medium', label: 'Medium', blurb: 'Solid, fair fight' },
  { value: 'hard', label: 'Hard', blurb: 'Strong — no easy wins' },
]

export function FullGameSetup({
  difficulty,
  onDifficultyChange,
  onStart,
}: {
  difficulty: ChessDifficulty
  onDifficultyChange: (d: ChessDifficulty) => void
  onStart: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-6 pt-6 text-center">
      <Mascot mood="relaxed" size={90} />
      <SpeechBubble>
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          Pick a challenge — you play white
        </p>
      </SpeechBubble>

      <div className="mt-8 flex w-full flex-col gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onDifficultyChange(d.value)}
            className={`rounded-2xl border p-4 text-left ${
              difficulty === d.value
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                : 'border-[var(--color-surface-outline)] bg-[var(--color-surface)]'
            }`}
          >
            <p className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
              {d.label}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">{d.blurb}</p>
          </button>
        ))}
      </div>

      <Button variant="primary" className="mt-8 w-full" onClick={onStart}>
        Start game
      </Button>
    </div>
  )
}
