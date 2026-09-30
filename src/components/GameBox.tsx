import { GameLineIcon } from './GameLineIcon'
import { usePlatform } from '../platform/PlatformProvider'

export interface GameBoxProps {
  gameId: string
  name: string
  color: string
  isNew?: boolean
  played: boolean
  /** "Lv N / star N" for the 5 level-based games. */
  levelMeta?: { level: number; stars: number }
  /** "Best N" for the 3 match/puzzle games with no "level" concept. */
  bestScore?: number
  /** 0-1, level-based games only — a raw best score has no natural ceiling to show as a fraction. */
  progressFraction?: number
}

function PlayGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M2 1.5l6 3.5-6 3.5z" fill="var(--home-ink)" />
    </svg>
  )
}

export function GameBox({
  gameId,
  name,
  color,
  isNew,
  played,
  levelMeta,
  bestScore,
  progressFraction,
}: GameBoxProps) {
  const platform = usePlatform()

  return (
    <div
      onClick={() => platform.haptics.impact('light')}
      className="relative flex flex-col justify-between rounded-[16px] border-[2.5px] border-[var(--home-ink)] p-3 shadow-[4px_4px_0_var(--home-shadow)] transition-transform duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_var(--home-shadow)]"
      style={{ aspectRatio: '1 / 0.85', background: `color-mix(in srgb, ${color} var(--gamebox-tint), var(--home-surface))` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[14px] border-[2px] border-[var(--navy-900)] shadow-[3px_3px_0_var(--navy-900)]"
          style={{ background: color }}
        >
          <GameLineIcon gameId={gameId} size={28} />
        </div>

        {isNew ? (
          <span
            className="rounded-full border-2 border-[var(--navy-900)] bg-[#FF4D7E] px-2 py-0.5 text-[11px] font-extrabold text-white"
            style={{ transform: 'rotate(-4deg)' }}
          >
            NEW
          </span>
        ) : played ? (
          <div className="text-right text-[13px] font-bold leading-tight text-[var(--home-ink)] opacity-70">
            {levelMeta ? (
              <>
                <p>Lv {levelMeta.level}</p>
                <p>★ {levelMeta.stars}</p>
              </>
            ) : (
              <p>Best {bestScore}</p>
            )}
          </div>
        ) : (
          <span className="flex items-center gap-1 rounded-full border-2 border-[var(--home-ink)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--home-ink)]">
            <PlayGlyph />
            Play
          </span>
        )}
      </div>

      <div>
        <p className="line-clamp-2 font-[var(--font-heading)] text-[18px] font-extrabold leading-tight text-[var(--home-ink)]">
          {name}
        </p>
        {progressFraction !== undefined && (
          <div
            className="mt-1.5 h-[6px] w-full overflow-hidden rounded-full border-[1.5px] border-[var(--navy-900)]"
            style={{ background: 'var(--home-surface)' }}
            role="progressbar"
            aria-valuenow={Math.round(progressFraction * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${name} progress`}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(progressFraction * 100)}%`,
                background: `color-mix(in srgb, ${color} 85%, black 15%)`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
