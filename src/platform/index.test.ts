import { describe, expect, it } from 'vitest'
import { detectPlatform } from './index'

describe('detectPlatform', () => {
  it('falls back to the browser adapter when there is no Telegram WebApp initData', () => {
    const platform = detectPlatform()
    expect(platform.kind).toBe('browser')
  })
})
