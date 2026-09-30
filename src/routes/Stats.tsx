import { TopBar } from '../components/TopBar'
import { StatTile } from '../components/StatTile'
import { XpBar } from '../components/XpBar'
import { EmptyState } from '../components/EmptyState'
import { getLocalStatsSummary } from '../lib/localGameStore'
import { getStreak } from '../lib/streak'
import { getUnlockedAchievementIds, ACHIEVEMENTS } from '../lib/achievements'
import { levelForXp, xpFromStars } from '../lib/xp'

export function Stats() {
  const stats = getLocalStatsSummary()
  const streak = getStreak()
  const level = levelForXp(xpFromStars(stats.totalStars))
  const unlocked = getUnlockedAchievementIds({ stats, longestStreak: streak.longest })

  if (stats.gamesWithRecords === 0) {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar center={<span className="font-[var(--font-heading)] font-extrabold">Stats</span>} />
        <EmptyState
          mood="sleepy"
          title="Nothing to show yet"
          message="Play a level to start earning XP and stars — your level and progress show up here."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar center={<span className="font-[var(--font-heading)] font-extrabold">Stats</span>} />

      <div className="mx-auto w-full max-w-md flex-1 px-4 pt-6">
        <XpBar level={level} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatTile label="Total stars" value={String(stats.totalStars)} />
          <StatTile label="Games played" value={String(stats.gamesWithRecords)} />
          <StatTile label="Current streak" value={`${streak.current}d`} />
          <StatTile label="Longest streak" value={`${streak.longest}d`} />
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] px-4 py-3">
          <p className="text-sm text-[var(--color-text-secondary)]">Achievements unlocked</p>
          <p className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
            {unlocked.size} / {ACHIEVEMENTS.length}
          </p>
        </div>
      </div>
    </div>
  )
}
