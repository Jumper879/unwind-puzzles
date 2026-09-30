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
  const soundEnabled = useUiStore((s) => s.soundEnabled)
  const setSoundEnabled = useUiStore((s) => s.setSoundEnabled)

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

        <Card className="mt-4 flex items-center justify-between p-5">
          <div>
            <p className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
              Sound
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Soft tones for taps, wins and hints.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            aria-label="Toggle sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
              soundEnabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-outline)]'
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                soundEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </Card>

        <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
          Haptic feedback follows your device's own vibration/haptics settings.
        </p>
      </div>
    </div>
  )
}
