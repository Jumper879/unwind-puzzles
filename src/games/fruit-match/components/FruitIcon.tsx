import type { Special } from '../engine/types'

// Soft-3D "clay" treatment (radial highlight + drop shadow), same material
// language as GameIcon — real illustrated fruit art can replace these
// later without touching the engine or interaction code.
const FRUIT_STYLES = [
  { bg: 'radial-gradient(circle at 35% 30%, var(--coral-400), var(--coral-600))', shape: '50%' }, // "cherry"
  { bg: 'radial-gradient(circle at 35% 30%, var(--butter-400), var(--butter-600))', shape: '50%' }, // "lemon"
  { bg: 'radial-gradient(circle at 35% 30%, var(--mint-400), var(--mint-600))', shape: '40%' }, // "lime"
  {
    bg: 'radial-gradient(circle at 35% 30%, var(--sky-400), var(--sky-600))',
    shape: '50% 50% 50% 10%',
  }, // "grape"
  {
    bg: 'radial-gradient(circle at 35% 30%, var(--lavender-400), var(--lavender-600))',
    shape: '50%',
  }, // "plum"
  {
    bg: 'radial-gradient(circle at 35% 30%, var(--peach-400), var(--peach-600))',
    shape: '45% 45% 50% 50% / 55% 55% 45% 45%',
  }, // "peach"
]

export function FruitIcon({ fruit, special }: { fruit: number; special: Special }) {
  const style = FRUIT_STYLES[fruit % FRUIT_STYLES.length]
  return (
    <div
      className="relative flex h-[78%] w-[78%] items-center justify-center shadow-[inset_0_2px_3px_rgb(255_255_255_/_45%),0_3px_6px_rgb(4_7_58_/_25%)]"
      style={{ background: style.bg, borderRadius: style.shape }}
    >
      {special === 'line-h' && (
        <div className="absolute inset-x-[-2px] h-[3px] rounded-full bg-white/80" />
      )}
      {special === 'line-v' && (
        <div className="absolute inset-y-[-2px] w-[3px] rounded-full bg-white/80" />
      )}
      {special === 'bomb' && (
        <div
          className="absolute inset-0 rounded-full border-2 border-white/80"
          style={{ margin: 2 }}
        />
      )}
      {special === 'color' && (
        <svg viewBox="0 0 24 24" width="60%" height="60%" className="absolute" aria-hidden>
          <path
            d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"
            fill="white"
            fillOpacity={0.9}
          />
        </svg>
      )}
    </div>
  )
}
