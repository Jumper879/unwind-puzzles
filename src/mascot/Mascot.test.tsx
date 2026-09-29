import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Mascot } from './Mascot'

describe('Mascot', () => {
  it('renders with an accessible label for the given mood', () => {
    render(<Mascot mood="celebrating" />)
    expect(screen.getByRole('img', { name: /celebrating/i })).toBeInTheDocument()
  })

  it('defaults to the relaxed mood', () => {
    render(<Mascot />)
    expect(screen.getByRole('img', { name: /relaxed/i })).toBeInTheDocument()
  })
})
