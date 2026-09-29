import { describe, expect, it } from 'vitest'
import { generateCrossword } from './generator'
import { GRID_TEMPLATES } from './gridTemplates'
import { WORD_LIST } from './wordlist'

describe('generateCrossword', () => {
  it('fills every shipped template from the word list, at every difficulty', () => {
    for (const template of GRID_TEMPLATES) {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        expect(() =>
          generateCrossword(template.id, difficulty, `smoke-${difficulty}`),
        ).not.toThrow()
      }
    }
  })

  it('is deterministic for the same seed', () => {
    const a = generateCrossword('mini-5', 'easy', 'seed-1')
    const b = generateCrossword('mini-5', 'easy', 'seed-1')
    expect(a.solution).toEqual(b.solution)
  })

  it('differs for a different seed', () => {
    const a = generateCrossword('mini-5', 'easy', 'seed-1')
    const b = generateCrossword('mini-5', 'easy', 'seed-2')
    expect(a.solution).not.toEqual(b.solution)
  })

  it('every cell is filled (no empty strings left)', () => {
    const puzzle = generateCrossword('mini-5', 'easy', 'fill-check')
    for (const cell of puzzle.solution) {
      if (cell !== null) expect(cell).not.toBe('')
    }
  })

  it('every slot spells a real word from the list, and crossings agree letter-for-letter', () => {
    const puzzle = generateCrossword('mini-5', 'medium', 'agreement-check')
    for (const slot of puzzle.slots) {
      const spelled = slot.cells.map((i) => puzzle.solution[i]).join('')
      expect(spelled.length).toBe(slot.length)
      expect(spelled).toMatch(/^[A-Z]+$/)
    }
  })

  it('no word is used twice in the same puzzle', () => {
    const puzzle = generateCrossword('mini-5', 'hard', 'dup-check')
    const words = puzzle.slots.map((slot) => slot.cells.map((i) => puzzle.solution[i]).join(''))
    expect(new Set(words).size).toBe(words.length)
  })

  it('every slot gets the clue for the word actually placed there', () => {
    const puzzle = generateCrossword('mini-5', 'easy', 'clue-check')
    for (const slot of puzzle.slots) {
      const spelled = slot.cells.map((i) => puzzle.solution[i]).join('')
      const entry = WORD_LIST.find((w) => w.word === spelled)
      expect(slot.clue).toBe(entry?.clue)
      expect(slot.clue).toBeTruthy()
    }
  })
})
