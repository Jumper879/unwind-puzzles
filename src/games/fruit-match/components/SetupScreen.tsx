import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { Button } from '../../../components/Button'
import { getLocalLevelProgress } from '../../../lib/localGameStore'
import { targetScoreFor, moveLimitFor } from '../engine/scoring'
import type { Difficulty } from '../engine/types'

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const LEVEL_COUNT = 10

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth={1.4} />
      <path
        d="M5 7V5a3 3 0 016 0v2"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SetupScreen({
  difficulty,
  onDifficultyChange,
  onStart,
}: {
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  onStart: (level: number) => void
}) {
  const progress = getLocalLevelProgress('fruit-match', 'classic', difficulty)
  const highestUnlocked = progress.highestLevel + 1

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-6 pt-6 text-center">
      <Mascot mood="relaxed" size={90} />
      <SpeechBubble>
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          Match fruit, hit the score target
        </p>
      </SpeechBubble>

      <div className="mt-8 w-full">
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

      <div className="mt-6 w-full">
        <p className="mb-2 text-left text-sm font-bold text-[var(--color-text-secondary)]">Level</p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: LEVEL_COUNT }, (_, i) => i + 1).map((level) => {
            const unlocked = level <= highestUnlocked
            const stars = progress.starsByLevel[level] ?? 0
            return (
              <button
                key={level}
                type="button"
                disabled={!unlocked}
                onClick={() => onStart(level)}
                className={`flex flex-col items-center rounded-xl border py-2 text-sm font-bold disabled:opacity-40 ${
                  stars > 0
                    ? 'border-[var(--mint-500)] bg-[var(--mint-100)] text-[var(--mint-800)]'
                    : 'border-[var(--color-surface-outline)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'
                }`}
              >
                {unlocked ? level : <LockIcon />}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
        Level {Math.min(highestUnlocked, LEVEL_COUNT)} goal: score{' '}
        {targetScoreFor(Math.min(highestUnlocked, LEVEL_COUNT), difficulty)} in{' '}
        {moveLimitFor(difficulty)} moves
      </p>

      <Button variant="primary" className="mt-4 w-full" onClick={() => onStart(highestUnlocked)}>
        Play level {Math.min(highestUnlocked, LEVEL_COUNT)}
      </Button>
    </div>
  )
}
