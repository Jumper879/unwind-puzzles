import { TopBar } from '../components/TopBar'
import { BrandLogo } from '../components/BrandLogo'

export function About() {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar center={<span className="font-[var(--font-heading)] font-extrabold">About</span>} />

      <div className="mx-auto w-full max-w-md flex-1 px-6 pt-8 text-[var(--color-text-secondary)]">
        {/* The vertical lockup is pre-composed on an opaque navy canvas, so it
            gets a matching navy card rather than floating on this white page. */}
        <div className="mx-auto mb-6 w-fit rounded-[28px] bg-[var(--navy-900)] p-6">
          <BrandLogo variant="vertical" className="h-28 w-auto object-contain" />
        </div>
        <p className="mb-4">
          Unwind Puzzles is a calm, single-player puzzle collection — built to be played in short
          sessions without pressure, timers you don't want, or ads that interrupt you.
        </p>
        <p className="mb-4">
          This app is early in development. Progress is currently stored on this device only;
          account sync, leaderboards and cloud saves are coming in a later build.
        </p>
        <p>No third-party trackers or analytics are used.</p>
      </div>
    </div>
  )
}
