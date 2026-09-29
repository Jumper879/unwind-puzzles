import type { SudokuSize } from '../engine/types'

export function NumberHand({
  size,
  remainingCounts,
  selectedDigit,
  onSelect,
}: {
  size: SudokuSize
  /** How many of each digit are still missing from the solved grid — a card empties out once all of that digit are placed correctly. */
  remainingCounts: number[]
  selectedDigit: number | null
  onSelect: (digit: number) => void
}) {
  return (
    <div className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {Array.from({ length: size }, (_, i) => i + 1).map((digit) => {
        const remaining = remainingCounts[digit - 1] ?? 0
        const depleted = remaining <= 0
        return (
          <button
            key={digit}
            type="button"
            disabled={depleted}
            onClick={() => onSelect(digit)}
            aria-pressed={selectedDigit === digit}
            aria-label={`Number ${digit}, ${remaining} remaining`}
            className={`flex aspect-square flex-col items-center justify-center rounded-xl border font-[var(--font-heading)] font-bold shadow-[inset_0_2px_0_rgb(255_255_255_/_50%),0_4px_10px_var(--color-shadow)] disabled:opacity-30 disabled:shadow-none ${
              selectedDigit === digit
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-surface-outline)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'
            }`}
          >
            <span className="text-[clamp(14px,3.6vw,20px)] leading-none">{digit}</span>
            {!depleted && (
              <span className="mt-0.5 text-[9px] font-semibold opacity-70">{remaining}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
