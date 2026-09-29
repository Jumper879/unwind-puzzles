import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { Card } from '../../../components/Card'
import { CAPTURE_PUZZLES } from '../engine/capturePuzzles'
import { MATE_PUZZLES } from '../engine/matePuzzles'

export function PuzzleSetup({
  onSelectCapture,
  onSelectMate,
}: {
  onSelectCapture: (id: string) => void
  onSelectMate: (id: string) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-6 pt-6 text-center">
      <Mascot mood="thinking" size={90} />
      <SpeechBubble>
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          Pick a puzzle
        </p>
      </SpeechBubble>

      <div className="mt-8 w-full">
        <h2 className="mb-2 text-left text-sm font-bold text-[var(--color-text-secondary)]">
          Capture all the pieces
        </h2>
        <div className="flex flex-col gap-2">
          {CAPTURE_PUZZLES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectCapture(p.id)}
              className="text-left"
            >
              <Card className="flex items-center justify-between px-4 py-3">
                <span className="font-bold capitalize text-[var(--color-text-primary)]">
                  {p.pieceType} · {p.targets.length} targets
                </span>
                <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-bold capitalize text-[var(--color-accent-strong)]">
                  {p.difficulty}
                </span>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 w-full">
        <h2 className="mb-2 text-left text-sm font-bold text-[var(--color-text-secondary)]">
          Checkmate in 1
        </h2>
        <div className="flex flex-col gap-2">
          {MATE_PUZZLES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectMate(p.id)}
              className="text-left"
            >
              <Card className="flex items-center justify-between px-4 py-3">
                <span className="font-bold text-[var(--color-text-primary)]">{p.goal}</span>
                <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-bold capitalize text-[var(--color-accent-strong)]">
                  {p.difficulty}
                </span>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
