import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { Button } from '../../../components/Button'
import type { Difficulty, SudokuSize } from '../engine/types'

const SIZES: { value: SudokuSize; label: string }[] = [
  { value: 4, label: '4×4' },
  { value: 6, label: '6×6' },
  { value: 9, label: '9×9' },
]

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function SetupScreen({
  size,
  difficulty,
  onSizeChange,
  onDifficultyChange,
  onStart,
}: {
  size: SudokuSize
  difficulty: Difficulty
  onSizeChange: (s: SudokuSize) => void
  onDifficultyChange: (d: Difficulty) => void
  onStart: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-6 pt-6 text-center">
      <Mascot mood="relaxed" size={90} />
      <SpeechBubble>
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          Pick a grid size and a challenge
        </p>
      </SpeechBubble>

      <div className="mt-8 w-full">
        <p className="mb-2 text-left text-sm font-bold text-[var(--color-text-secondary)]">
          Grid size
        </p>
        <div className="flex gap-2">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSizeChange(s.value)}
              className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-bold ${
                size === s.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                  : 'border-[var(--color-surface-outline)] text-[var(--color-text-secondary)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 w-full">
        <p className="mb-2 text-left text-sm font-bold text-[var(--color-text-secondary)]">
          Difficulty
        </p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onDifficultyChange(d.value)}
              className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-bold ${
                difficulty === d.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                  : 'border-[var(--color-surface-outline)] text-[var(--color-text-secondary)]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" className="mt-8 w-full" onClick={onStart}>
        Start puzzle
      </Button>
    </div>
  )
}
