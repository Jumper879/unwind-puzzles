import { TopBar } from '../components/TopBar'
import { Mascot } from '../mascot/Mascot'

export function HowToPlay() {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">How to play</span>}
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-6 pt-8 text-center text-[var(--color-text-secondary)]">
        <Mascot mood="encouraging" size={96} />
        <p className="mt-4 mb-4">
          Pick any game from the home screen. The first time you open one, a short overlay shows its
          goal and controls — most games also give you Undo, Hints, and a Restart, so there's no
          penalty for taking your time.
        </p>
        <p>
          Try <span className="font-bold text-[var(--color-text-primary)]">Daily Unwind</span> for 3
          fresh picks every day, and check <span className="font-bold text-[var(--color-text-primary)]">Achievements</span> and{' '}
          <span className="font-bold text-[var(--color-text-primary)]">Stats</span> in the menu to
          track your streak and XP.
        </p>
      </div>
    </div>
  )
}
