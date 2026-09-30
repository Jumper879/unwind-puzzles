import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { Records } from './Records'
import { recordLocalBest, recordLocalLevelResult } from '../lib/localGameStore'

describe('Records', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows a "no records yet" empty state with no local play history (no Supabase project configured)', () => {
    render(
      <MemoryRouter>
        <Records />
      </MemoryRouter>,
    )
    expect(screen.getByText('No records yet')).toBeInTheDocument()
  })

  it('renders real local records once a game has been played (local-first, no backend needed)', () => {
    recordLocalBest('word-search', 'animals', 'easy', 90, 42000)
    recordLocalLevelResult('word-search', 'animals', 'easy', 1, 3)

    render(
      <MemoryRouter>
        <Records />
      </MemoryRouter>,
    )

    expect(screen.getByText('Word Search')).toBeInTheDocument()
    expect(screen.getByText('90 pts')).toBeInTheDocument()
    expect(screen.getByText('Games with records')).toBeInTheDocument()
  })
})
