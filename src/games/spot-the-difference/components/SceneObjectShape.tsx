import type { SceneObject } from '../engine/types'

/** Renders one scene object as flat, rounded shapes in our brand's calm palette — same "no photoreal art, simple SVG primitives" approach as the mascot and fruit icons. viewBox is 0-100 in both axes; x/y/size are that object's normalized (0-1) values already scaled by the caller. */
export function SceneObjectShape({ object }: { object: SceneObject }) {
  const { type, x, y, size, rotation, hue, flipped } = object
  const cx = x * 100
  const cy = y * 100
  const r = size * 100
  const fill = `hsl(${hue}, 55%, 68%)`
  const darkFill = `hsl(${hue}, 50%, 52%)`

  const transform = `translate(${cx} ${cy}) rotate(${rotation}) scale(${flipped ? -1 : 1} 1)`

  return (
    <g transform={transform}>
      {type === 'sun' && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={i}
              x1={0}
              y1={0}
              x2={0}
              y2={-r * 1.6}
              stroke="var(--butter-400)"
              strokeWidth={r * 0.25}
              strokeLinecap="round"
              transform={`rotate(${i * 45})`}
            />
          ))}
          <circle r={r} fill="var(--butter-400)" />
        </>
      )}
      {type === 'cloud' && (
        <g fill="white" stroke="var(--color-surface-outline)" strokeWidth={0.5}>
          <circle cx={-r * 0.5} r={r * 0.6} />
          <circle cx={r * 0.5} r={r * 0.6} />
          <circle r={r * 0.75} />
        </g>
      )}
      {type === 'tree' && (
        <g>
          <rect x={-r * 0.15} y={0} width={r * 0.3} height={r * 0.9} fill="var(--peach-600)" />
          <circle cy={-r * 0.3} r={r} fill={fill} />
        </g>
      )}
      {type === 'bush' && (
        <g fill={fill}>
          <circle cx={-r * 0.4} r={r * 0.6} />
          <circle cx={r * 0.4} r={r * 0.6} />
          <circle r={r * 0.75} />
        </g>
      )}
      {type === 'flower' && (
        <g>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx={0} cy={-r * 0.6} rx={r * 0.3} ry={r * 0.45} fill={fill} transform={`rotate(${deg})`} />
          ))}
          <circle r={r * 0.35} fill="var(--butter-500)" />
        </g>
      )}
      {type === 'rock' && <ellipse rx={r} ry={r * 0.7} fill={darkFill} />}
      {type === 'butterfly' && (
        <g fill={fill}>
          <ellipse cx={-r * 0.5} rx={r * 0.55} ry={r * 0.8} />
          <ellipse cx={r * 0.5} rx={r * 0.55} ry={r * 0.8} />
          <rect x={-r * 0.08} y={-r * 0.6} width={r * 0.16} height={r * 1.2} fill="var(--navy-800)" />
        </g>
      )}
      {type === 'hill' && <ellipse rx={r * 1.8} ry={r} fill={fill} />}
    </g>
  )
}
