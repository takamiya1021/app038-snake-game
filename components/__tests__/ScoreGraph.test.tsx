/**
 * ScoreGraphコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react'
import ScoreGraph from '../ScoreGraph'
import type { GameHistory } from '@/lib/db/schema'

describe('ScoreGraph', () => {
  const mockHistory: GameHistory[] = [
    {
      id: 1,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
      mode: 'normal',
      difficulty: 'normal',
      finalScore: 80,
      finalLevel: 2,
      survivalTime: 60000,
      foodsEaten: 8,
      deathCause: 'wall',
      scoreEfficiency: 1.33,
    },
    {
      id: 2,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
      mode: 'normal',
      difficulty: 'normal',
      finalScore: 120,
      finalLevel: 3,
      survivalTime: 90000,
      foodsEaten: 12,
      deathCause: 'self',
      scoreEfficiency: 1.33,
    },
    {
      id: 3,
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      mode: 'aiBattle',
      difficulty: 'hard',
      finalScore: 150,
      finalLevel: 3,
      survivalTime: 120000,
      foodsEaten: 15,
      deathCause: 'wall',
      scoreEfficiency: 1.25,
    },
  ]

  describe('Rendering', () => {
    it('should render graph container', () => {
      render(<ScoreGraph history={mockHistory} />)

      expect(screen.getByTestId('score-graph')).toBeInTheDocument()
    })

    it('should render graph title', () => {
      render(<ScoreGraph history={mockHistory} />)

      expect(screen.getByText('スコア推移')).toBeInTheDocument()
    })

    it('should render canvas element for graph', () => {
      render(<ScoreGraph history={mockHistory} />)

      const canvas = screen.getByRole('img', { hidden: true })
      expect(canvas).toBeInTheDocument()
      expect(canvas.tagName).toBe('CANVAS')
    })
  })

  describe('Graph Data Points', () => {
    it('should display all score data points', () => {
      render(<ScoreGraph history={mockHistory} />)

      // Should render score range information
      expect(screen.getByText(/スコア範囲/)).toBeInTheDocument()
    })

    it('should show highest score marker', () => {
      render(<ScoreGraph history={mockHistory} />)

      expect(screen.getByText('最高: 150')).toBeInTheDocument()
    })

    it('should show lowest score marker', () => {
      render(<ScoreGraph history={mockHistory} />)

      expect(screen.getByText('最低: 80')).toBeInTheDocument()
    })

    it('should show average score line', () => {
      render(<ScoreGraph history={mockHistory} />)

      // Average of 80, 120, 150 is 116.67, rounded to 117
      expect(screen.getByText(/平均.*117/)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show message when no data', () => {
      render(<ScoreGraph history={[]} />)

      expect(
        screen.getByText('データがありません')
      ).toBeInTheDocument()
    })

    it('should not render canvas when no data', () => {
      render(<ScoreGraph history={[]} />)

      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument()
    })
  })

  describe('Time Range Display', () => {
    it('should show time range of data', () => {
      render(<ScoreGraph history={mockHistory} />)

      expect(screen.getByText(/最近.*ゲーム/)).toBeInTheDocument()
    })

    it('should format dates on x-axis', () => {
      render(<ScoreGraph history={mockHistory} />)

      // Should show date labels
      expect(screen.getByTestId('score-graph')).toBeInTheDocument()
    })
  })

  describe('Trend Indicator', () => {
    it('should show upward trend when scores improving', () => {
      // History is newest first, so improving = [newest(high), ..., oldest(low)]
      const improvingHistory = [
        { ...mockHistory[0], finalScore: 150 },
        { ...mockHistory[1], finalScore: 100 },
        { ...mockHistory[2], finalScore: 50 },
      ]

      render(<ScoreGraph history={improvingHistory} />)

      expect(screen.getByText(/↗/)).toBeInTheDocument()
      expect(screen.getByText(/スコアが上昇中！/)).toBeInTheDocument()
    })

    it('should show downward trend when scores declining', () => {
      // History is newest first, so declining = [newest(low), ..., oldest(high)]
      const decliningHistory = [
        { ...mockHistory[0], finalScore: 50 },
        { ...mockHistory[1], finalScore: 100 },
        { ...mockHistory[2], finalScore: 150 },
      ]

      render(<ScoreGraph history={decliningHistory} />)

      expect(screen.getByText(/↘/)).toBeInTheDocument()
      expect(screen.getByText(/練習が必要かも/)).toBeInTheDocument()
    })

    it('should show stable trend when scores consistent', () => {
      const stableHistory = mockHistory.map((h) => ({ ...h, finalScore: 100 }))

      render(<ScoreGraph history={stableHistory} />)

      expect(screen.getByText(/→/)).toBeInTheDocument()
      expect(screen.getByText(/安定しています/)).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should adjust canvas size to container', () => {
      render(<ScoreGraph history={mockHistory} />)

      const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for canvas', () => {
      render(<ScoreGraph history={mockHistory} />)

      const canvas = screen.getByRole('img', { hidden: true })
      expect(canvas).toHaveAttribute('aria-label', 'スコア推移グラフ')
    })

    it('should provide text alternative for screen readers', () => {
      render(<ScoreGraph history={mockHistory} />)

      expect(
        screen.getByText(/スコア範囲: 80〜150/)
      ).toBeInTheDocument()
    })
  })
})
