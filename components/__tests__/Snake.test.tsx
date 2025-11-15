/**
 * Snakeコンポーネントのテスト
 */

import { render } from '@testing-library/react'
import Snake from '../Snake'
import type { Snake as SnakeType } from '@/lib/types/game'

describe('Snake Component', () => {
  const mockSnake: SnakeType = {
    id: 'player',
    body: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: 'right',
    nextDirection: 'right',
    color: '#10b981',
    score: 0,
    alive: true,
  }

  const cellSize = 20

  it('should render without crashing', () => {
    const { container } = render(<Snake snake={mockSnake} cellSize={cellSize} />)
    expect(container).toBeInTheDocument()
  })

  it('should render correct number of segments', () => {
    const { container } = render(<Snake snake={mockSnake} cellSize={cellSize} />)
    const segments = container.querySelectorAll('[data-testid^="snake-segment"]')
    expect(segments.length).toBe(mockSnake.body.length)
  })

  it('should apply correct color', () => {
    const { container } = render(<Snake snake={mockSnake} cellSize={cellSize} />)
    const head = container.querySelector('[data-testid="snake-segment-0"]')
    expect(head).toHaveStyle({ backgroundColor: mockSnake.color })
  })

  it('should position segments correctly', () => {
    const { container } = render(<Snake snake={mockSnake} cellSize={cellSize} />)
    const head = container.querySelector('[data-testid="snake-segment-0"]') as HTMLElement

    expect(head).toHaveStyle({
      left: `${mockSnake.body[0].x * cellSize}px`,
      top: `${mockSnake.body[0].y * cellSize}px`,
    })
  })

  it('should differentiate head from body', () => {
    const { container } = render(<Snake snake={mockSnake} cellSize={cellSize} />)
    const head = container.querySelector('[data-testid="snake-segment-0"]')
    const bodySegment = container.querySelector('[data-testid="snake-segment-1"]')

    expect(head).toHaveClass('snake-head')
    expect(bodySegment).not.toHaveClass('snake-head')
  })

  it('should handle single segment snake', () => {
    const singleSegmentSnake: SnakeType = {
      ...mockSnake,
      body: [{ x: 10, y: 10 }],
    }
    const { container } = render(<Snake snake={singleSegmentSnake} cellSize={cellSize} />)
    const segments = container.querySelectorAll('[data-testid^="snake-segment"]')
    expect(segments.length).toBe(1)
  })

  it('should apply gradient effect to body', () => {
    const { container } = render(<Snake snake={mockSnake} cellSize={cellSize} />)
    const segments = container.querySelectorAll('[data-testid^="snake-segment"]')

    // 各セグメントが異なる不透明度を持つことを確認
    const opacities = Array.from(segments).map(seg =>
      window.getComputedStyle(seg as Element).opacity
    )

    // 少なくとも1つの異なる不透明度があることを確認
    expect(new Set(opacities).size).toBeGreaterThan(1)
  })
})
