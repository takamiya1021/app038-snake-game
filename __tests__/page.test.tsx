import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('should render the title', () => {
    render(<Home />)
    const heading = screen.getByText('SNAKE GAME')
    expect(heading).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(<Home />)
    const description = screen.getByText('AI搭載スネークゲーム')
    expect(description).toBeInTheDocument()
  })
})
