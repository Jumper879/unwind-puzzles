import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { EmptyState } from '../components/EmptyState'
import { StatTile } from '../components/StatTile'
import { Card } from '../components/Card'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSessionStore } from '../state/useSessionStore'
import { getGame } from '../games/registry'
import { getLocalStatsSummary, type LocalBestRow } from '../lib/localGameStore'
import { getStreak } from '../lib/streak'

interface PersonalBestRow {
  game_id: string
  mode: string
  difficulty: string
  best_score: number
  best_time_ms: number
  achieved_at: string
}

interface RecordsData {
  personalBests: PersonalBestRow[]
  totalStars: number
  totalPlaytimeMs: number
  longestStreak: number
  gamesWithRecords: number
}

function localBestToRow(b: LocalBestRow): PersonalBestRow {
  return {
    game_id: b.gameId,
    mode: b.mode,
    difficulty: b.difficulty,
    best_score: b.score,
    best_time_ms: b.timeMs,
    achieved_at: b.achievedAt,
  }
}

function loadLocalRecordsData(): RecordsData {
  const summary = getLocalStatsSummary()
  const streak = getStreak()
  return {
    personalBests: summary.bests
      .map(localBestToRow)
      .sort((a, b) => b.achieved_at.localeCompare(a.achieved_at)),
    totalStars: summary.totalStars,
    totalPlaytimeMs: summary.totalPlaytimeMs,
    longestStreak: streak.longest,
    gamesWithRecords: summary.gamesWithRecords,
  }
}

function formatPlaytime(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

export function Records() {
  const session = useSessionStore((s) => s.session)
  const sessionStatus = useSessionStore((s) => s.status)
  const [data, setData] = useState<RecordsData | null>(isSupabaseConfigured ? null : loadLocalRecordsData())
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    // Not configured: local data is already loaded synchronously in the
    // initial state above — nothing to do here. Configured but no session
    // yet: stay in the loading state, this effect re-runs once
    // useBootstrapSession resolves one.
    if (!isSupabaseConfigured || !supabase || !session) return
    let cancelled = false

    ;(async () => {
      // RLS scopes every one of these to the caller's own rows already —
      // no explicit .eq('profile_id', ...) needed.
      const [bestsRes, progressRes, streaksRes, resultsRes] = await Promise.all([
        supabase
          .from('personal_bests')
          .select('game_id, mode, difficulty, best_score, best_time_ms, achieved_at')
          .order('achieved_at', { ascending: false }),
        supabase.from('progress').select('stars_total'),
        supabase.from('streaks').select('longest').maybeSingle(),
        supabase.from('results').select('time_ms').eq('is_valid', true),
      ])

      if (cancelled) return

      const personalBests = bestsRes.data ?? []
      const totalStars = (progressRes.data ?? []).reduce((sum, p) => sum + (p.stars_total ?? 0), 0)
      const totalPlaytimeMs = (resultsRes.data ?? []).reduce((sum, r) => sum + (r.time_ms ?? 0), 0)

      setData({
        personalBests,
        totalStars,
        totalPlaytimeMs,
        longestStreak: streaksRes.data?.longest ?? 0,
        gamesWithRecords: new Set(personalBests.map((b) => b.game_id)).size,
      })
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [session])

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">My Records</span>}
      />

      {isSupabaseConfigured && loading && sessionStatus !== 'error' ? (
        <div className="flex flex-1 items-center justify-center text-[var(--color-text-secondary)]">
          Loading…
        </div>
      ) : !data || data.personalBests.length === 0 ? (
        <EmptyState
          mood="encouraging"
          title="No records yet"
          message="Play a level to start building your stats here. A chart of your improvement over time shows up once you've got some history."
        />
      ) : (
        <div className="mx-auto w-full max-w-md flex-1 px-4 pt-6">
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Games with records" value={String(data.gamesWithRecords)} />
            <StatTile label="Total stars" value={String(data.totalStars)} />
            <StatTile label="Total playtime" value={formatPlaytime(data.totalPlaytimeMs)} />
            <StatTile label="Longest streak" value={`${data.longestStreak}d`} />
          </div>

          <h2 className="mb-3 mt-6 font-[var(--font-heading)] text-lg font-extrabold text-[var(--color-text-primary)]">
            Personal bests
          </h2>
          <div className="flex flex-col gap-2">
            {data.personalBests.map((row) => (
              <Card
                key={`${row.game_id}-${row.mode}-${row.difficulty}`}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
                    {getGame(row.game_id)?.name ?? row.game_id}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {row.mode} · {row.difficulty}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--color-text-primary)]">{row.best_score} pts</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {(row.best_time_ms / 1000).toFixed(1)}s
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
