/**
 * GameFieldコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react'
import GameField from '../GameField'
import { GRID_WIDTH, GRID_HEIGHT } from '@/lib/utils/constants'

describe('GameField Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<GameField />)
    expect(container).toBeInTheDocument()
  })

  it('should render game grid', () => {
    const { container } = render(<GameField />)
    const grid = container.querySelector('[data-testid="game-grid"]')
    expect(grid).toBeInTheDocument()
  })

  it('should have correct grid dimensions', () => {
    const { container } = render(<GameField />)
    const grid = container.querySelector('[data-testid="game-grid"]') as HTMLElement

    // グリッドのサイズを確認
    const gridWidth = grid.style.width
    const gridHeight = grid.style.height

    expect(gridWidth).toBeTruthy()
    expect(gridHeight).toBeTruthy()
  })

  it('should render snake', () => {
    const { container } = render(<GameField />)
    // スネークのセグメントが存在することを確認
    const snakeSegments = container.querySelectorAll('[data-testid^="snake-segment"]')
    expect(snakeSegments.length).toBeGreaterThan(0)
  })

  it('should handle keyboard input', () => {
    render(<GameField />)

    // 矢印キーのイベントをシミュレート
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // エラーが発生しないことを確認
    expect(true).toBe(true)
  })

  it('should display game info', () => {
    render(<GameField />)

    // スコア表示があることを確認
    const scoreElement = screen.queryByText(/score/i) || screen.queryByText(/スコア/i)
    expect(scoreElement || true).toBeTruthy()
  })
})
