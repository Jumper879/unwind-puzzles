import type { CellPattern } from '../engine/types'

function ShapeMark({ pattern }: { pattern: CellPattern }) {
  const { shapeType, variant, shapeColor } = pattern

  if (shapeType === 'wedge') {
    const corners: Record<string, string> = {
      tl: 'M0,0 L20,0 A20,20 0 0 1 0,20 Z',
      tr: 'M40,0 L40,20 A20,20 0 0 1 20,0 Z',
      br: 'M40,40 L20,40 A20,20 0 0 1 40,20 Z',
      bl: 'M0,40 L0,20 A20,20 0 0 1 20,40 Z',
    }
    return <path d={corners[variant]} fill={shapeColor} />
  }

  if (shapeType === 'triangle') {
    const points: Record<string, string> = {
      up: '20,8 32,30 8,30',
      right: '32,20 10,32 10,8',
      down: '20,32 8,10 32,10',
      left: '8,20 30,8 30,32',
    }
    return <polygon points={points[variant]} fill={shapeColor} />
  }

  if (shapeType === 'halfCircle') {
    const half: Record<string, string> = {
      top: 'M6,20 A14,14 0 0 1 34,20 Z',
      bottom: 'M6,20 A14,14 0 0 0 34,20 Z',
      left: 'M20,6 A14,14 0 0 0 20,34 Z',
      right: 'M20,6 A14,14 0 0 1 20,34 Z',
    }
    return <path d={half[variant]} fill={shapeColor} />
  }

  if (shapeType === 'diamond') {
    const r = variant === 'large' ? 15 : 9
    return (
      <polygon
        points={`20,${20 - r} ${20 + r},20 20,${20 + r} ${20 - r},20`}
        fill={shapeColor}
      />
    )
  }

  const r = variant === 'large' ? 12 : 7
  return <circle cx={20} cy={20} r={r} fill={shapeColor} />
}

export function MosaicTile({
  pattern,
  className = '',
}: {
  pattern: CellPattern
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`aspect-square w-full overflow-hidden rounded-lg ${className}`}
      style={{ background: pattern.bgColor }}
      aria-hidden
    >
      <ShapeMark pattern={pattern} />
    </svg>
  )
}
