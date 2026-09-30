import { GameLineIcon } from './GameLineIcon'
import { usePlatform } from '../platform/PlatformProvider'

export function GameBox({
  gameId,
  name,
  color,
  meta,
  isNew,
}: {
  gameId: string
  name: string
  color: string
  /** 0-2 short lines, e.g. ["Lv 12", "★ 24"], ["Best 90"], or ["New"]. Ignored when isNew. */
  meta: string[]
  isNew?: boolean
}) {
  const platform = usePlatform()

  return (
    <div
      onClick={() => platform.haptics.impact('light')}
      className="relative flex aspect-square flex-col justify-between rounded-[16px] border-[2.5px] border-[var(--home-ink)] bg-[var(--home-surface)] p-3 shadow-[4px_4px_0_var(--home-shadow)] transition-transform duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_var(--home-shadow)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[12px] border-[2px] border-[var(--home-ink)]"
          style={{ background: color }}
        >
          <GameLineIcon gameId={gameId} />
        </div>

        {isNew ? (
          <span className="rounded-full bg-[var(--coral-700)] px-2 py-0.5 text-[10px] font-extrabold text-white">
            NEW
          </span>
        ) : (
          <div className="text-right text-[13px] font-bold leading-tight text-[var(--home-ink)] opacity-70">
            {meta.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}
      </div>

      <p className="line-clamp-2 font-[var(--font-heading)] text-[17px] font-bold leading-tight text-[var(--home-ink)]">
        {name}
      </p>
    </div>
  )
}
