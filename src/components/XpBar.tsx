import type { LevelInfo } from '../lib/xp'

export function XpBar({ level }: { level: LevelInfo }) {
  const pct = Math.round((level.xpIntoLevel / level.xpForNextLevel) * 100)

  return (
    <div className="w-full rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between">
        <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
          Level {level.level}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {level.xpIntoLevel} / {level.xpForNextLevel} XP
        </p>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[var(--color-bg)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
