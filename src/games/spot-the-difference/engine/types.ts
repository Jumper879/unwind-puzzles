export type Difficulty = 'easy' | 'medium' | 'hard'

export type ObjectType = 'sun' | 'cloud' | 'tree' | 'bush' | 'flower' | 'rock' | 'butterfly' | 'hill'

export interface SceneObject {
  id: number
  type: ObjectType
  /** Normalized 0-1, so hotspots work at any render size. */
  x: number
  y: number
  size: number
  rotation: number
  hue: number
  flipped: boolean
}

export type ChangeKind = 'removed' | 'moved' | 'resized' | 'recolored' | 'flipped'

export interface SceneDifference {
  objectId: number
  kind: ChangeKind
  /** Normalized hotspot in the (b) scene — where the player needs to tap. */
  x: number
  y: number
  radius: number
}

export interface ScenePuzzle {
  sceneA: SceneObject[]
  sceneB: SceneObject[]
  differences: SceneDifference[]
  seed: string
  difficulty: Difficulty
}
