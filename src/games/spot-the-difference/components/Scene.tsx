import { useRef } from 'react'
import { SceneObjectShape } from './SceneObjectShape'
import type { SceneDifference, SceneObject } from '../engine/types'

const LAYER_ORDER: Record<SceneObject['type'], number> = {
  hill: 0,
  rock: 1,
  bush: 2,
  tree: 3,
  flower: 4,
  butterfly: 5,
  cloud: 6,
  sun: 7,
}

export function Scene({
  objects,
  foundMarkers,
  hintHotspot,
  wrongTapMarker,
  onTap,
  label,
}: {
  objects: SceneObject[]
  foundMarkers: SceneDifference[]
  hintHotspot: SceneDifference | null
  wrongTapMarker: { x: number; y: number } | null
  onTap?: (xNorm: number, yNorm: number) => void
  label: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const sorted = [...objects].sort((a, b) => LAYER_ORDER[a.type] - LAYER_ORDER[b.type])

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!onTap || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const xNorm = (e.clientX - rect.left) / rect.width
    const yNorm = (e.clientY - rect.top) / rect.height
    onTap(xNorm, yNorm)
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      onClick={handleClick}
      className="aspect-square w-full touch-none rounded-2xl border border-[var(--color-surface-outline)]"
      style={{ background: 'linear-gradient(180deg, var(--sky-100), var(--mint-100))' }}
    >
      {sorted.map((object) => (
        <SceneObjectShape key={object.id} object={object} />
      ))}

      {foundMarkers.map((d) => (
        <circle
          key={d.objectId}
          cx={d.x * 100}
          cy={d.y * 100}
          r={d.radius * 100}
          fill="none"
          stroke="var(--mint-600)"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
      ))}

      {hintHotspot && (
        <circle
          cx={hintHotspot.x * 100}
          cy={hintHotspot.y * 100}
          r={hintHotspot.radius * 100}
          fill="var(--butter-400)"
          opacity={0.5}
          className="animate-pulse"
        />
      )}

      {wrongTapMarker && (
        <circle cx={wrongTapMarker.x * 100} cy={wrongTapMarker.y * 100} r={3} fill="var(--coral-500)" opacity={0.8} />
      )}
    </svg>
  )
}
