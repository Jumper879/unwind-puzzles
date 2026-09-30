import { describe, expect, it } from 'vitest'
import { greetingForHour } from './greeting'

describe('greetingForHour', () => {
  it('is morning from 5 up to 11', () => {
    expect(greetingForHour(5)).toMatch(/morning/)
    expect(greetingForHour(11)).toMatch(/morning/)
  })

  it('is afternoon from 12 up to 16', () => {
    expect(greetingForHour(12)).toMatch(/afternoon/)
    expect(greetingForHour(16)).toMatch(/afternoon/)
  })

  it('is evening from 17 through midnight and up to 4', () => {
    expect(greetingForHour(17)).toMatch(/evening/)
    expect(greetingForHour(23)).toMatch(/evening/)
    expect(greetingForHour(0)).toMatch(/evening/)
    expect(greetingForHour(4)).toMatch(/evening/)
  })
})
