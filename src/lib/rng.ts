/**
 * Deterministic seeded RNG (mulberry32) shared by every game engine — the
 * same seed always produces the same sequence, which is what lets a puzzle
 * be fully reproduced from (game, mode, difficulty, seed) alone, per
 * PLAN.md. Not cryptographic; just needs to be fast and reproducible.
 */
export function createRng(seed: string): () => number {
  let state = hashSeed(seed)
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

export function randomInt(rng: () => number, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive)
}

export function shuffle<T>(rng: () => number, items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** A fresh, non-reproducible seed for ad-hoc local play (no level number involved). */
export function randomSeed(): string {
  return crypto.randomUUID()
}
