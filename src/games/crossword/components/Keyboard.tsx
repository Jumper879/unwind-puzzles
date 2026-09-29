const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

export function Keyboard({
  onLetter,
  onBackspace,
}: {
  onLetter: (letter: string) => void
  onBackspace: () => void
}) {
  return (
    <div className="flex w-full flex-col items-center gap-1.5" data-testid="crossword-keyboard">
      {ROWS.map((row, i) => (
        <div key={row} className="flex w-full justify-center gap-1">
          {row.split('').map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => onLetter(letter)}
              className="h-9 flex-1 max-w-9 rounded-lg border border-[var(--color-surface-outline)] bg-[var(--color-surface)] text-sm font-bold text-[var(--color-text-primary)] shadow-[0_2px_4px_var(--color-shadow)] active:scale-95"
            >
              {letter}
            </button>
          ))}
          {i === 2 && (
            <button
              type="button"
              onClick={onBackspace}
              aria-label="Backspace"
              className="flex h-9 flex-1 max-w-14 items-center justify-center rounded-lg border border-[var(--color-surface-outline)] bg-[var(--color-surface)] shadow-[0_2px_4px_var(--color-shadow)] active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M7 5h9a1 1 0 011 1v8a1 1 0 01-1 1H7l-4.5-5L7 5z"
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 8l4 4M13.5 8l-4 4"
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
