import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUiStore } from '../state/useUiStore'
import { IconButton } from '../components/IconButton'
import { BrutalCard } from '../components/BrutalCard'
import { GameBox } from '../components/GameBox'
import { LogoHeroCard } from '../components/LogoHeroCard'
import { GAMES } from '../games/registry'
import { getStreak } from '../lib/streak'
import { getDailyPicks } from '../lib/daily'
import {
  getDailyPlayedToday,
  getLocalStatsSummary,
  getPerGameProgress,
  type LocalBestRow,
} from '../lib/localGameStore'
import { todayDateString } from '../lib/date'

const GAME_COLORS: Record<string, string> = {
  'tic-tac-toe': '#8EC5FF',
  crossword: '#FFE08A',
  'word-search': '#7FE0B0',
  mosaic: '#B9A6FF',
  'spot-the-difference': '#FFB38A',
  chess: '#C9CED8',
  'fruit-match': '#FF8FA8',
  sudoku: '#C6EF6B',
}

// The 5 games with a real 10-level campaign (see GAMES.md) — X&O, Sudoku
// and Chess are match/puzzle-based with no "level" concept, so a raw best
// score is all they have (no natural ceiling to show as a progress bar).
const LEVEL_BASED_GAME_IDS = new Set([
  'word-search',
  'fruit-match',
  'crossword',
  'spot-the-difference',
  'mosaic',
])
const LEVEL_COUNT = 10

function bestScoreForGame(bests: LocalBestRow[], gameId: string): number | undefined {
  const rows = bests.filter((b) => b.gameId === gameId)
  if (rows.length === 0) return undefined
  return Math.max(...rows.map((b) => b.score))
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M2 5h16M2 10h16M2 15h16" stroke="var(--home-ink)" strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 3h8v4a4 4 0 01-8 0V3z" stroke="var(--home-ink)" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M6 4H3.5a2.5 2.5 0 002.5 3.2M14 4h2.5A2.5 2.5 0 0114 7.2" stroke="var(--home-ink)" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M8.5 11.5v1.5a1.5 1.5 0 01-1.5 1.5H6.5v1.5h7v-1.5H12A1.5 1.5 0 0110.5 13v-1.5" stroke="var(--home-ink)" strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5.5" stroke="var(--home-ink)" strokeWidth={2} />
      <path d="M17 17l-4.5-4.5" stroke="var(--home-ink)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" stroke="var(--home-ink)" strokeWidth={1.8} />
      <path d="M3 8h14M6.5 2.5v3M13.5 2.5v3" stroke="var(--home-ink)" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 4l10 6-10 6V4z" fill="var(--navy-900)" />
    </svg>
  )
}

function DailyProgressDots({ done, total }: { done: number; total: number }) {
  return (
    <div className="mt-1 flex items-center gap-1" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-1.5 flex-1 rounded-full"
          style={{ background: i < done ? 'var(--mint-600)' : 'var(--color-surface-outline)' }}
        />
      ))}
    </div>
  )
}

export function Home() {
  const openDrawer = useUiStore((s) => s.openDrawer)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const streak = getStreak()
  const today = todayDateString()
  const dailyPicks = getDailyPicks(today)
  const playedToday = getDailyPlayedToday()
  const dailyDone = dailyPicks.filter((p) => playedToday.has(p.gameId)).length
  const stats = getLocalStatsSummary()
  const perGame = getPerGameProgress()

  const filteredGames = query.trim()
    ? GAMES.filter((g) => g.name.toLowerCase().includes(query.trim().toLowerCase()))
    : GAMES

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--home-bg)' }}>
      <div className="mx-auto w-full max-w-md px-5 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
        <div className="flex items-center justify-between gap-2">
          <IconButton icon={<HamburgerIcon />} aria-label="Open menu" onClick={openDrawer} />
          <div className="flex-1" />
          <div className="flex gap-2">
            <Link to="/leaderboard">
              <IconButton icon={<TrophyIcon />} aria-label="Global leaderboard" />
            </Link>
            <IconButton
              icon={<SearchIcon />}
              aria-label={searchOpen ? 'Close search' : 'Search games'}
              aria-pressed={searchOpen}
              onClick={() => {
                setSearchOpen((v) => !v)
                if (searchOpen) setQuery('')
              }}
            />
          </div>
        </div>

        {searchOpen && (
          <div className="mt-4">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games…"
              aria-label="Search games"
              className="w-full rounded-[12px] border-[2.5px] border-[var(--home-ink)] bg-[var(--home-surface)] px-4 py-2.5 font-[var(--font-heading)] font-bold text-[var(--home-ink)] shadow-[3px_3px_0_var(--home-shadow)] outline-none placeholder:opacity-50"
            />
          </div>
        )}

        {!searchOpen && (
          <>
            <div className="mt-3">
              <LogoHeroCard />
            </div>

            <Link to="/daily" className="mt-5 block">
              <BrutalCard className="flex items-center gap-3 px-4 py-3">
                <CalendarIcon />
                <div className="flex-1">
                  <p className="font-[var(--font-heading)] text-sm font-extrabold text-[var(--home-ink)]">
                    Daily Unwind · 3 puzzles today
                  </p>
                  <p className="text-xs font-bold opacity-60" style={{ color: 'var(--home-ink)' }}>
                    {dailyDone}/{dailyPicks.length} done
                  </p>
                  <DailyProgressDots done={dailyDone} total={dailyPicks.length} />
                </div>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border-[2.5px] border-[var(--home-ink)]"
                  style={{ background: '#FFD43B' }}
                  aria-hidden
                >
                  <PlayIcon />
                </span>
              </BrutalCard>
            </Link>
          </>
        )}

        <div className="mb-3 mt-5 flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-[17px] font-bold text-[var(--home-ink)]">
            {query.trim() ? 'Results' : 'All Games'}
          </h2>
          {!query.trim() && (
            <span className="font-[var(--font-heading)] text-sm font-bold text-[var(--home-ink)]">
              {streak.current > 0
                ? `🔥 ${streak.current} day${streak.current === 1 ? '' : 's'}`
                : '✨ Start a streak'}
            </span>
          )}
        </div>

        {filteredGames.length === 0 ? (
          <p className="py-8 text-center text-sm font-bold opacity-60" style={{ color: 'var(--home-ink)' }}>
            No games match "{query}"
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredGames.map((game) => {
              const progress = perGame[game.id]
              const isLevelBased = LEVEL_BASED_GAME_IDS.has(game.id)
              const played = isLevelBased
                ? Boolean(progress && progress.highestLevel > 0)
                : bestScoreForGame(stats.bests, game.id) !== undefined

              return (
                <Link key={game.id} to={`/games/${game.id}`}>
                  <GameBox
                    gameId={game.id}
                    name={game.name}
                    color={GAME_COLORS[game.id] ?? '#8EC5FF'}
                    isNew={game.isNew}
                    played={played}
                    levelMeta={
                      isLevelBased && progress && progress.highestLevel > 0
                        ? { level: progress.highestLevel, stars: progress.totalStars }
                        : undefined
                    }
                    bestScore={!isLevelBased ? bestScoreForGame(stats.bests, game.id) : undefined}
                    progressFraction={
                      isLevelBased && progress && progress.highestLevel > 0
                        ? Math.min(1, progress.highestLevel / LEVEL_COUNT)
                        : undefined
                    }
                  />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
