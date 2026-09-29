import { Mascot } from '../mascot/Mascot'

/**
 * The mascot + wordmark text, used wherever the app needs a "logo" instead
 * of the raster horizontal/vertical lockups. Those lockups are pre-composed
 * on an opaque navy canvas and read badly at small sizes (their text turns
 * to mush — see /dev/icons); this renders crisply at any size on any
 * background, and is the same mark used for the app/favicon icon
 * (public/icons, generated from brand/icon.png).
 */
export function BrandMark({
  size = 26,
  textClassName = 'text-[var(--color-text-primary)]',
}: {
  size?: number
  textClassName?: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Mascot size={size} />
      <span className={`font-[var(--font-heading)] text-sm font-extrabold ${textClassName}`}>
        Unwind Puzzles
      </span>
    </span>
  )
}
