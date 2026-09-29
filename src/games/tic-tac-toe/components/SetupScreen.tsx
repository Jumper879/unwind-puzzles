import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { Button } from '../../../components/Button'
import type { Difficulty, TicTacToeMode } from '../engine/types'

const MODES: { value: TicTacToeMode; label: string; blurb: string }[] = [
  { value: 'classic', label: 'Classic 3×3', blurb: 'Three in a row' },
  { value: 'connect4', label: '4×4', blurb: 'Four in a row' },
]

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function SetupScreen({
  mode,
  difficulty,
  onModeChange,
  onDifficultyChange,
  onStart,
}: {
  mode: TicTacToeMode
  difficulty: Difficulty
  onModeChange: (m: TicTacToeMode) => void
  onDifficultyChange: (d: Difficulty) => void
  onStart: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-6 pt-6 text-center">
      <Mascot mood="relaxed" size={90} />
      <SpeechBubble>
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          Pick a board and a challenge
        </p>
      </SpeechBubble>

      <div className="mt-8 w-full">
        <p className="mb-2 text-left text-sm font-bold text-[var(--color-text-secondary)]">Board</p>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onModeChange(m.value)}
              className={`rounded-2xl border p-4 text-left ${
                mode === m.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-surface-outline)] bg-[var(--color-surface)]'
              }`}
            >
              <p className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
                {m.label}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">{m.blurb}</p>
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
        Start match
      </Button>
    </div>
  )
}
