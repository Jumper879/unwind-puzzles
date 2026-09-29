import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { EmptyState } from '../components/EmptyState'
import { Card } from '../components/Card'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSessionStore } from '../state/useSessionStore'
import { GAMES } from '../games/registry'

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
type Difficulty = (typeof DIFFICULTIES)[number]
type Period = 'alltime' | 'weekly'

interface Row {
  rank: number
  profile_id: string
  display_name: string | null
  avatar_mood?: string | null
  best_score?: number
  score?: number
  best_time_ms?: number
  time_ms?: number
}

export function Leaderboard() {
  const session = useSessionStore((s) => s.session)
  const [gameId, setGameId] = useState(GAMES[0].id)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [period, setPeriod] = useState<Period>('alltime')
  const [rows, setRows] = useState<Row[] | null>(null)
  const [myRank, setMyRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    // Not configured: `loading` already started false (see useState above).
    if (!isSupabaseConfigured || !supabase) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      const fn = period === 'alltime' ? 'alltime_leaderboard' : 'weekly_leaderboard'
      const myFn = period === 'alltime' ? 'my_alltime_rank' : 'my_weekly_rank'

      const { data: list } = await supabase.rpc(fn, {
        p_game_id: gameId,
        p_mode: 'classic',
        p_difficulty: difficulty,
        p_limit: 50,
      })

      let rank: number | null = null
      if (session) {
        const { data: mine } = await supabase.rpc(myFn, {
          p_game_id: gameId,
          p_mode: 'classic',
          p_difficulty: difficulty,
        })
        rank = mine?.[0]?.rank ?? null
      }

      if (cancelled) return
      setRows((list as Row[] | null) ?? [])
      setMyRank(rank)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [gameId, difficulty, period, session])

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={
          <span className="font-[var(--font-heading)] font-extrabold">Global Leaderboard</span>
        }
      />

      {!isSupabaseConfigured ? (
        <EmptyState
          mood="sleepy"
          title="Not connected yet"
          message="Leaderboards need a Supabase project configured — see .env.example."
        />
      ) : (
        <div className="mx-auto w-full max-w-md flex-1 px-4 pt-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {GAMES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGameId(g.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold whitespace-nowrap ${
                  gameId === g.id
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                    : 'border-[var(--color-surface-outline)] text-[var(--color-text-secondary)]'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-xl border px-2 py-1.5 text-sm font-bold capitalize ${
                  difficulty === d
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                    : 'border-[var(--color-surface-outline)] text-[var(--color-text-secondary)]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            {(['alltime', 'weekly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`flex-1 rounded-xl px-2 py-1.5 text-sm font-bold ${
                  period === p
                    ? 'bg-[var(--navy-900)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                }`}
              >
                {p === 'alltime' ? 'All-time' : 'This week'}
              </button>
            ))}
          </div>

          {myRank && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
              Your rank:{' '}
              <span className="font-bold text-[var(--color-text-primary)]">#{myRank}</span>
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {loading ? (
              <p className="py-8 text-center text-[var(--color-text-secondary)]">Loading…</p>
            ) : !rows || rows.length === 0 ? (
              <EmptyState
                mood="relaxed"
                title="No scores yet"
                message="Be the first to set a record for this game and difficulty."
              />
            ) : (
              rows.map((row) => (
                <Card key={row.profile_id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-6 text-center font-[var(--font-heading)] font-bold text-[var(--color-text-secondary)]">
                    {row.rank}
                  </span>
                  <span className="flex-1 font-semibold text-[var(--color-text-primary)]">
                    {row.display_name ?? 'Player'}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {row.best_score ?? row.score} pts
                  </span>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
