import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { useUiStore, type ThemePreference } from '../state/useUiStore'

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function Settings() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">Settings</span>}
      />

      <div className="mx-auto w-full max-w-md flex-1 px-4 pt-6">
        <Card className="p-5">
          <p className="mb-3 font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
            Appearance
          </p>
          <div className="flex gap-2">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                aria-pressed={theme === opt.value}
                className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                  theme === opt.value
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                    : 'border-[var(--color-surface-outline)] text-[var(--color-text-secondary)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
          Sound, haptics and relax mode land alongside their first games (Phase 3+).
        </p>
      </div>
    </div>
  )
}
