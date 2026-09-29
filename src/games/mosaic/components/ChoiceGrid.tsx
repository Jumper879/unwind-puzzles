import { MosaicTile } from './MosaicTile'
import type { MosaicChoice } from '../engine/types'

export function ChoiceGrid({
  choices,
  wrongIds,
  solved,
  onSelect,
}: {
  choices: MosaicChoice[]
  wrongIds: Set<string>
  solved: boolean
  onSelect: (choice: MosaicChoice) => void
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      {choices.map((choice) => {
        const isWrong = wrongIds.has(choice.id)
        const isRevealedCorrect = solved && choice.correct
        const ringClass = isRevealedCorrect
          ? 'border-[var(--mint-600)] ring-2 ring-[var(--mint-500)]'
          : isWrong
            ? 'border-[var(--coral-500)] opacity-50'
            : 'border-[var(--color-surface-outline)]'

        return (
          <button
            key={choice.id}
            type="button"
            disabled={solved || isWrong}
            onClick={() => onSelect(choice)}
            aria-label={`Choice tile ${choice.id}`}
            className={`rounded-2xl border-2 bg-[var(--color-surface)] p-2 shadow-[0_6px_14px_var(--color-shadow)] transition active:scale-95 disabled:active:scale-100 ${ringClass}`}
          >
            <MosaicTile pattern={choice.pattern} />
          </button>
        )
      })}
    </div>
  )
}
