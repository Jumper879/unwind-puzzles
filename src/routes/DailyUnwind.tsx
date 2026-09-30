import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { GameIcon } from '../components/GameIcon'
import { Mascot } from '../mascot/Mascot'
import { SpeechBubble } from '../components/SpeechBubble'
import { getDailyPicks, type DailyPick } from '../lib/daily'
import { getDailyPlayedToday } from '../lib/localGameStore'
import { completeDailyStreak, getStreak, type StreakState } from '../lib/streak'
import { todayDateString } from '../lib/date'
import { getGame } from '../games/registry'

interface DailyState {
  playedToday: Set<string>
  streak: StreakState
}

/**
 * Reads today's play progress and, if all picks are already done, completes
 * the streak (idempotent — see streak.ts). Called once at mount via the
 * lazy useState initializer below, and again from genuine event callbacks
 * (focus/visibilitychange) when the player comes back from a game — never
 * as a synchronous setState-in-effect, which the React Compiler flags.
 */
function computeDailyState(picks: DailyPick[], today: string): DailyState {
  const playedToday = getDailyPlayedToday()
  const allDone = picks.length > 0 && picks.every((p) => playedToday.has(p.gameId))
  const streak = allDone ? completeDailyStreak(today) : getStreak()
  return { playedToday, streak }
}

export function DailyUnwind() {
  const today = useMemo(() => todayDateString(), [])
  const picks = useMemo(() => getDailyPicks(today), [today])
  const [state, setState] = useState<DailyState>(() => computeDailyState(picks, today))

  useEffect(() => {
    function refresh() {
      setState(computeDailyState(picks, today))
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [picks, today])

  const { playedToday, streak } = state
  const doneCount = picks.filter((p) => playedToday.has(p.gameId)).length
  const allDone = doneCount === picks.length

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">Daily Unwind</span>}
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pt-6">
        <Mascot mood={allDone ? 'celebrating' : 'relaxed'} size={80} />
        <SpeechBubble>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            {allDone
              ? "Today's 3 done — see you tomorrow!"
              : `${doneCount}/${picks.length} today's picks done`}
          </p>
        </SpeechBubble>

        <div className="mt-4 flex w-full items-center justify-between rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] px-4 py-2.5 text-sm">
          <span className="text-[var(--color-text-secondary)]">Streak</span>
          <span className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
            {streak.current > 0
              ? `${streak.current} day${streak.current === 1 ? '' : 's'} · longest ${streak.longest}`
              : 'Finish today to start one'}
          </span>
        </div>

        <div className="mt-6 flex w-full flex-col gap-3">
          {picks.map((pick) => {
            const game = getGame(pick.gameId)
            if (!game) return null
            const done = playedToday.has(pick.gameId)
            return (
              <Link key={pick.gameId} to={`/games/${pick.gameId}`}>
                <Card className="flex items-center gap-3 px-4 py-3 active:scale-[0.98]">
                  <GameIcon game={game} size={48} />
                  <div className="flex-1 text-left">
                    <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
                      {game.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{game.tagline}</p>
                  </div>
                  {done ? (
                    <span className="rounded-full bg-[var(--mint-200)] px-2.5 py-1 text-[11px] font-bold text-[var(--mint-800)]">
                      Done ✓
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent-strong)]">
                      Play
                    </span>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
          3 games, picked fresh every day. Finish all 3 to keep your streak going.
        </p>
      </div>
    </div>
  )
}
