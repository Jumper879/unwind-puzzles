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
          Pick any game from the home screen. Each one opens with a short goal from your guide here,
          and every level gives you Undo, Hints, and a Restart — there's no penalty for taking your
          time.
        </p>
        <p>
          Turn on <span className="font-bold text-[var(--color-text-primary)]">Relax mode</span> in
          a game's settings to remove timers and star pressure entirely. Each game's own tutorial
          lands alongside it — X&O and Word Search are first.
        </p>
      </div>
    </div>
  )
}
