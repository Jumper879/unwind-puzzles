export function WordList({ words, found }: { words: string[]; found: Set<string> }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {words.map((word) => (
        <span
          key={word}
          className={`rounded-full border px-3 py-1 text-sm font-bold ${
            found.has(word)
              ? 'border-[var(--mint-500)] bg-[var(--mint-100)] text-[var(--mint-700)] line-through'
              : 'border-[var(--color-surface-outline)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'
          }`}
        >
          {word}
        </span>
      ))}
    </div>
  )
}
