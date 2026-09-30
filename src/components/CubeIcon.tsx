/** Hand-drawn stand-in — no "cube" exists in the provided object sprite sheet (see PLAN.md's Phase 8 report). */
export function CubeIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full" aria-hidden>
      <polygon points="50,6 92,28 50,50 8,28" fill="var(--sky-400)" />
      <polygon points="8,28 50,50 50,94 8,72" fill="var(--sky-600)" />
      <polygon points="92,28 50,50 50,94 92,72" fill="var(--sky-500)" />
    </svg>
  )
}
