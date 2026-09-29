/**
 * A stat tile per the dataviz skill's "Figures" contract: sentence-case
 * label with no trailing colon, semibold proportional-figure value. No
 * delta/sparkline — there's no prior period to compare against yet.
 * Deliberately no per-tile hue: these 4 numbers aren't a categorical
 * series telling one story, just independent facts, so they share one
 * neutral card style rather than an arbitrary rainbow.
 */
export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] px-4 py-3">
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-0.5 font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  )
}
