/** Flat 100 XP per level — simple and legible over a curve, nothing here needs pacing tuned yet. */
const XP_PER_LEVEL = 100
const XP_PER_STAR = 10

export function xpFromStars(totalStars: number): number {
  return totalStars * XP_PER_STAR
}

export interface LevelInfo {
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
}

export function levelForXp(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  return { level, xpIntoLevel, xpForNextLevel: XP_PER_LEVEL }
}
