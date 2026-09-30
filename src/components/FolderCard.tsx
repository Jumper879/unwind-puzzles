import { GameLineIcon } from './GameLineIcon'
import { BrutalCard } from './BrutalCard'

export function FolderCard({
  gameId,
  name,
  color,
  meta,
  isNew,
}: {
  gameId: string
  name: string
  color: string
  meta: string
  isNew?: boolean
}) {
  return (
    <div className="relative pt-3 active:scale-[0.98]">
      <div
        className="absolute left-0 top-0 h-3 w-[45%] rounded-t-[8px] border-[2.5px] border-b-0 border-[var(--home-ink)]"
        style={{ background: color }}
        aria-hidden
      />
      <BrutalCard className="relative flex min-h-[130px] flex-col justify-between p-3">
        {isNew && (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--coral-700)] px-2 py-0.5 text-[10px] font-extrabold text-white">
            NEW
          </span>
        )}
        <div className="flex items-center gap-2">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border-[2px] border-[var(--home-ink)]"
            style={{ background: color }}
          >
            <GameLineIcon gameId={gameId} />
          </div>
          <span className="text-xs font-bold text-[var(--home-ink)] opacity-70">{meta}</span>
        </div>
        <p className="mt-2 font-[var(--font-heading)] text-[15px] font-extrabold leading-tight text-[var(--home-ink)]">
          {name}
        </p>
      </BrutalCard>
    </div>
  )
}
