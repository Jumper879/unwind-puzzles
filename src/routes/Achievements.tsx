import { TopBar } from '../components/TopBar'
import { AchievementCard } from '../components/AchievementCard'
import { ACHIEVEMENTS, getUnlockedAchievementIds } from '../lib/achievements'
import { getLocalStatsSummary } from '../lib/localGameStore'
import { getStreak } from '../lib/streak'

export function Achievements() {
  const stats = getLocalStatsSummary()
  const streak = getStreak()
  const unlocked = getUnlockedAchievementIds({ stats, longestStreak: streak.longest })

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">Achievements</span>}
      />

      <div className="mx-auto w-full max-w-md flex-1 px-4 pt-6">
        <p className="mb-4 text-center text-sm text-[var(--color-text-secondary)]">
          {unlocked.size} of {ACHIEVEMENTS.length} unlocked
        </p>
        <div className="flex flex-col gap-2.5">
          {ACHIEVEMENTS.map((a) => (
            <AchievementCard key={a.id} achievement={a} unlocked={unlocked.has(a.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
