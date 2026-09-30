import type { HapticImpactStyle, HapticNotificationType } from '../platform/types'

/**
 * Procedural sound effects — plain Web Audio oscillator tones, no audio
 * files. Same "no external/licensed assets" policy already used for every
 * game's art (Fruit Match's icons, Spot the Difference's scenes, Missing
 * Piece's tiles): nothing to license, nothing to ship as a binary asset.
 */

let sharedCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!sharedCtx) sharedCtx = new Ctor()
  return sharedCtx
}

let enabledGetter: () => boolean = () => true

/** Wired once from useUiStore at app startup — see PlatformProvider/App. */
export function setSoundEnabledGetter(getter: () => boolean): void {
  enabledGetter = getter
}

function tone(freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 0.05): void {
  if (!enabledGetter()) return
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gainNode.gain.value = gain

  const now = ctx.currentTime
  const durationS = durationMs / 1000
  gainNode.gain.setValueAtTime(gain, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationS)

  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + durationS)
}

export function playImpact(style: HapticImpactStyle): void {
  const freq = style === 'heavy' ? 220 : style === 'medium' ? 340 : 480
  tone(freq, 70, 'sine', 0.04)
}

export function playNotification(type: HapticNotificationType): void {
  if (type === 'success') {
    tone(523, 90, 'sine', 0.05)
    window.setTimeout(() => tone(784, 140, 'sine', 0.05), 90)
  } else if (type === 'error') {
    tone(180, 160, 'sawtooth', 0.04)
  } else {
    tone(300, 100, 'triangle', 0.04)
  }
}
