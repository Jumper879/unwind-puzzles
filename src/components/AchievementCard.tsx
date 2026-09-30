import type { Achievement } from '../lib/achievements'

function TrophyIcon({ locked }: { locked: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4h10v5a5 5 0 01-10 0V4z"
        fill={locked ? 'var(--color-surface-outline)' : 'var(--butter-500)'}
      />
      <path
        d="M7 5H4a3 3 0 003 4M17 5h3a3 3 0 01-3 4"
        stroke={locked ? 'var(--color-surface-outline)' : 'var(--butter-600)'}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d="M10 14v2a2 2 0 01-2 2H7v2h10v-2h-1a2 2 0 01-2-2v-2"
        stroke={locked ? 'var(--color-surface-outline)' : 'var(--butter-600)'}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AchievementCard({
  achievement,
  unlocked,
}: {
  achievement: Achievement
  unlocked: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        unlocked
          ? 'border-[var(--butter-400)] bg-[var(--butter-100)]'
          : 'border-[var(--color-surface-outline)] bg-[var(--color-surface)] opacity-60'
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg)]">
        <TrophyIcon locked={!unlocked} />
      </div>
      <div>
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          {achievement.title}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">{achievement.description}</p>
      </div>
    </div>
  )
}
