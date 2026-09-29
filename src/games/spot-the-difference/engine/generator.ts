import { createRng, randomInt, shuffle } from '../../../lib/rng'
import type { ChangeKind, Difficulty, ObjectType, ScenePuzzle, SceneDifference, SceneObject } from './types'

const OBJECT_TYPES: ObjectType[] = ['sun', 'cloud', 'tree', 'bush', 'flower', 'rock', 'butterfly', 'hill']

const DIFFICULTY_CONFIG: Record<Difficulty, { objectCount: number; changeCount: number; wrongTapLimit: number }> = {
  easy: { objectCount: 10, changeCount: 4, wrongTapLimit: 5 },
  medium: { objectCount: 14, changeCount: 6, wrongTapLimit: 4 },
  hard: { objectCount: 18, changeCount: 8, wrongTapLimit: 3 },
}

export function getDifficultyConfig(difficulty: Difficulty) {
  return DIFFICULTY_CONFIG[difficulty]
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by)
}

/** Rejection-sampled placement — not a "realistic" scene layout, just spread out enough that objects don't pile on top of each other. */
function createBaseScene(rng: () => number, count: number): SceneObject[] {
  const objects: SceneObject[] = []
  let attempts = 0
  let nextId = 0

  // Size/gap is tuned so that even the "hard" object count is a real,
  // verified-achievable circle-packing (see generator.test.ts) — an
  // earlier, larger size range geometrically could not fit 18 objects in
  // this canvas no matter how many attempts were allowed, caught by a
  // test asserting the exact requested count rather than "some number
  // less than or equal to."
  while (objects.length < count && attempts < count * 400) {
    attempts++
    const x = 0.08 + rng() * 0.84
    const y = 0.12 + rng() * 0.76
    const size = 0.045 + rng() * 0.035
    const tooClose = objects.some((o) => distance(x, y, o.x, o.y) < size + o.size + 0.02)
    if (tooClose) continue

    objects.push({
      id: nextId++,
      type: OBJECT_TYPES[randomInt(rng, OBJECT_TYPES.length)],
      x,
      y,
      size,
      rotation: randomInt(rng, 360),
      hue: randomInt(rng, 360),
      flipped: rng() < 0.5,
    })
  }
  return objects
}

const CHANGE_KINDS: ChangeKind[] = ['removed', 'moved', 'resized', 'recolored', 'flipped']

function applyChange(object: SceneObject, kind: ChangeKind, rng: () => number): SceneObject | null {
  switch (kind) {
    case 'removed':
      return null
    case 'moved':
      return {
        ...object,
        x: Math.min(0.94, Math.max(0.06, object.x + (rng() < 0.5 ? -1 : 1) * (0.1 + rng() * 0.08))),
        y: Math.min(0.94, Math.max(0.06, object.y + (rng() < 0.5 ? -1 : 1) * (0.1 + rng() * 0.08))),
      }
    case 'resized':
      return { ...object, size: object.size * (rng() < 0.5 ? 0.6 : 1.5) }
    case 'recolored':
      return { ...object, hue: (object.hue + 120 + randomInt(rng, 120)) % 360 }
    case 'flipped':
      return { ...object, flipped: !object.flipped }
  }
}

export function generateScenePuzzle(difficulty: Difficulty, seed: string): ScenePuzzle {
  const config = DIFFICULTY_CONFIG[difficulty]
  const rng = createRng(`${difficulty}:${seed}`)
  const sceneA = createBaseScene(rng, config.objectCount)

  const changeTargets = shuffle(rng, sceneA).slice(0, Math.min(config.changeCount, sceneA.length))
  const sceneB = [...sceneA]
  const differences: SceneDifference[] = []

  for (const target of changeTargets) {
    const kind = CHANGE_KINDS[randomInt(rng, CHANGE_KINDS.length)]
    const index = sceneB.findIndex((o) => o.id === target.id)
    const changed = applyChange(sceneB[index], kind, rng)

    if (changed === null) {
      sceneB.splice(index, 1)
      differences.push({ objectId: target.id, kind, x: target.x, y: target.y, radius: target.size + 0.04 })
    } else {
      sceneB[index] = changed
      differences.push({
        objectId: target.id,
        kind,
        x: changed.x,
        y: changed.y,
        radius: Math.max(target.size, changed.size) + 0.04,
      })
    }
  }

  return { sceneA, sceneB, differences, seed, difficulty }
}
