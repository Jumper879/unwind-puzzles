const SIZES = [48, 96, 180] as const

/**
 * /dev/icons — side-by-side of the vertical-logo icon vs the mascot-only
 * icon, per PLAN.md's Phase 1 checkpoint. The vertical logo is what's
 * currently wired into manifest.webmanifest / apple-touch-icon; swap
 * generate-icons.py's default in scripts/generate-icons.py if you pick
 * mascot-only instead.
 */
export function IconsPreview() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-black">Icon comparison</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Vertical logo (current default) vs. mascot-only, at the sizes that matter most.
      </p>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="mb-4 font-bold">Vertical logo (default)</h2>
          <div className="flex flex-col items-center gap-6">
            {SIZES.map((s) => (
              <IconSample key={s} src={`/icons/variants/vertical-${s}.png`} size={s} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 font-bold">Mascot only</h2>
          <div className="flex flex-col items-center gap-6">
            {SIZES.map((s) => (
              <IconSample key={s} src={`/icons/variants/mascot-${s}.png`} size={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function IconSample({ src, size }: { src: string; size: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <img
        src={src}
        width={size}
        height={size}
        alt=""
        className="rounded-2xl shadow-[0_6px_14px_var(--color-shadow)]"
      />
      <span className="text-xs text-[var(--color-text-secondary)]">{size}px</span>
    </div>
  )
}
