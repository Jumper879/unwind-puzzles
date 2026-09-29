import { Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { GameIcon } from '../components/GameIcon'
import { Mascot } from '../mascot/Mascot'
import { GAMES } from '../games/registry'

// The horizontal/vertical brand lockups are pre-composed on an opaque navy
// canvas (by design — they're meant for navy surfaces like the drawer and
// splash), so on this light header we use the mascot + real text instead
// of stamping a navy rectangle onto the paper background.
function HomeBrandMark() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Mascot size={26} />
      <span className="font-[var(--font-heading)] text-sm font-extrabold text-[var(--color-text-primary)]">
        Unwind Puzzles
      </span>
    </span>
  )
}

export function Home() {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar center={<HomeBrandMark />} />

      <div className="mx-auto w-full max-w-md flex-1 px-4 pt-6">
        <Link to="/daily" className="block">
          <Card className="flex items-center gap-3 px-5 py-4 active:scale-[0.98]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-xl">
              ✦
            </div>
            <div className="flex-1 text-left">
              <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
                Daily Unwind
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                3 fresh puzzles, every day
              </p>
            </div>
            <span className="text-[var(--color-text-secondary)]" aria-hidden>
              →
            </span>
          </Card>
        </Link>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] px-4 py-2.5 text-sm">
          <span className="text-[var(--color-text-secondary)]">Streak</span>
          <span className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
            0 days — play today to start one
          </span>
        </div>

        <h2 className="mb-3 mt-8 font-[var(--font-heading)] text-lg font-extrabold text-[var(--color-text-primary)]">
          Games
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game) => (
            <Link key={game.id} to={`/games/${game.id}`}>
              <Card className="flex h-full flex-col gap-2 p-4 active:scale-[0.97]">
                <GameIcon game={game} />
                <div>
                  <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
                    {game.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{game.tagline}</p>
                </div>
                <span className="mt-auto self-start rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent-strong)]">
                  Phase {game.phase}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
