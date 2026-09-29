import type { GameMeta } from '../games/registry'

const GRADIENTS: Record<GameMeta['accent'], string> = {
  blue: 'linear-gradient(155deg, var(--blue-400), var(--blue-600))',
  sky: 'linear-gradient(155deg, var(--sky-400), var(--sky-600))',
  mint: 'linear-gradient(155deg, var(--mint-400), var(--mint-600))',
  peach: 'linear-gradient(155deg, var(--peach-400), var(--peach-600))',
  lavender: 'linear-gradient(155deg, var(--lavender-400), var(--lavender-600))',
  butter: 'linear-gradient(155deg, var(--butter-400), var(--butter-600))',
  coral: 'linear-gradient(155deg, var(--coral-400), var(--coral-600))',
  navy: 'linear-gradient(155deg, var(--navy-700), var(--navy-900))',
}

/**
 * Soft-3D placeholder tile until each game ships its own rendered icon at
 * /brand/game-icons/<id>.png (per PLAN.md) — same clay material language
 * as the buttons (inset highlight + soft drop shadow), just no artwork yet.
 */
export function GameIcon({ game, size = 56 }: { game: GameMeta; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl font-[var(--font-heading)] font-black text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: GRADIENTS[game.accent],
        boxShadow: 'inset 0 2px 0 rgb(255 255 255 / 35%), 0 6px 14px rgb(4 7 58 / 20%)',
      }}
      aria-hidden
    >
      {game.name.charAt(0)}
    </div>
  )
}
