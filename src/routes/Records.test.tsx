import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Records } from './Records'

describe('Records', () => {
  it('shows a "not connected" empty state with no Supabase project configured', () => {
    render(
      <MemoryRouter>
        <Records />
      </MemoryRouter>,
    )
    expect(screen.getByText('Not connected yet')).toBeInTheDocument()
  })
})
