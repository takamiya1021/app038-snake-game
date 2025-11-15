/**
 * GameHistoryコンポーネントのテスト
 */

import { render, screen, waitFor } from '@testing-library/react'
import GameHistory from '../GameHistory'
import * as dbSchema from '@/lib/db/schema'
import type { GameHistory as GameHistoryType } from '@/lib/db/schema'

// Mock the database
jest.mock('@/lib/db/schema', () => ({
  getGameHistory: jest.fn(),
  getHighScore: jest.fn(),
  getStatistics: jest.fn(),
}))

describe('GameHistory', () => {
  const mockGameHistory: GameHistoryType[] = [
    {
      id: 1,
      timestamp: Date.now() - 1000 * 60 * 10,
      mode: 'normal',
      difficulty: 'normal',
      finalScore: 150,
      finalLevel: 3,
      survivalTime: 120000,
      foodsEaten: 15,
      deathCause: 'wall',
      scoreEfficiency: 1.25,
    },
    {
      id: 2,
      timestamp: Date.now() - 1000 * 60 * 60,
      mode: 'aiBattle',
      difficulty: 'hard',
      finalScore: 200,
      finalLevel: 4,
      survivalTime: 180000,
      foodsEaten: 20,
      deathCause: 'self',
      scoreEfficiency: 1.11,
    },
    {
      id: 3,
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      mode: 'normal',
      difficulty: 'easy',
      finalScore: 80,
      finalLevel: 2,
      survivalTime: 60000,
      foodsEaten: 8,
      deathCause: 'wall',
      scoreEfficiency: 1.33,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(dbSchema.getGameHistory as jest.Mock).mockResolvedValue(mockGameHistory)
    ;(dbSchema.getHighScore as jest.Mock).mockResolvedValue(200)
    ;(dbSchema.getStatistics as jest.Mock).mockResolvedValue({
      totalGames: 3,
      averageScore: 143.33,
      highestScore: 200,
      totalPlayTime: 360000,
    })
  })

  describe('Rendering', () => {
    it('should render history title', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        expect(screen.getByText('ゲーム履歴')).toBeInTheDocument()
      })
    })

    it('should render loading state initially', () => {
      render(<GameHistory />)

      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })

    it('should render history items after loading', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        const scores = screen.getAllByTestId('history-score')
        expect(scores).toHaveLength(3)
        expect(scores[0]).toHaveTextContent('150')
        expect(scores[1]).toHaveTextContent('200')
        expect(scores[2]).toHaveTextContent('80')
      })
    })

    it('should display game mode for each entry', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        const modes = screen.getAllByText(/通常モード|AI対戦/)
        expect(modes.length).toBeGreaterThan(0)
      })
    })

    it('should display difficulty level', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        expect(screen.getByText('普通')).toBeInTheDocument()
        expect(screen.getByText('難しい')).toBeInTheDocument()
        expect(screen.getByText('簡単')).toBeInTheDocument()
      })
    })

    it('should format timestamps correctly', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        // Should show relative times like "10分前", "1時間前", "1日前"
        const timestamps = screen.getAllByText(/分前|時間前|日前/)
        expect(timestamps.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Statistics Display', () => {
    it('should show total games count', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        expect(screen.getByText('総プレイ回数')).toBeInTheDocument()
        // Should show stats summary
        const stats = screen.getByText('総プレイ回数').parentElement
        expect(stats).toHaveTextContent('3')
      })
    })

    it('should show highest score', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        expect(screen.getByText('最高スコア')).toBeInTheDocument()
        // Should show stats summary
        const stats = screen.getByText('最高スコア').parentElement
        expect(stats).toHaveTextContent('200')
      })
    })

    it('should show average score', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        expect(screen.getByText('平均スコア')).toBeInTheDocument()
        // Average of 150, 200, 80 is 143.33...
        expect(screen.getByText(/143/)).toBeInTheDocument()
      })
    })

    it('should format total play time', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        expect(screen.getByText('総プレイ時間')).toBeInTheDocument()
        // 360000ms = 6 minutes = "6分0秒"
        expect(screen.getByText(/6分/)).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no history', async () => {
      ;(dbSchema.getGameHistory as jest.Mock).mockResolvedValue([])
      ;(dbSchema.getStatistics as jest.Mock).mockResolvedValue({
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        totalPlayTime: 0,
      })

      render(<GameHistory />)

      await waitFor(() => {
        expect(
          screen.getByText('まだゲームをプレイしていません')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      ;(dbSchema.getGameHistory as jest.Mock).mockRejectedValue(
        new Error('DB Error')
      )

      render(<GameHistory />)

      await waitFor(() => {
        expect(
          screen.getByText('履歴の読み込みに失敗しました')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Sorting', () => {
    it('should display history sorted by timestamp (newest first)', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        const scores = screen.getAllByTestId('history-score')
        expect(scores[0]).toHaveTextContent('150') // Most recent
        expect(scores[1]).toHaveTextContent('200')
        expect(scores[2]).toHaveTextContent('80') // Oldest
      })
    })
  })

  describe('Death Cause Display', () => {
    it('should show death cause icons or text', async () => {
      render(<GameHistory />)

      await waitFor(() => {
        const wallDeaths = screen.getAllByText('壁に衝突')
        const selfDeaths = screen.getAllByText('自分に衝突')
        expect(wallDeaths.length).toBeGreaterThan(0)
        expect(selfDeaths.length).toBeGreaterThan(0)
      })
    })
  })
})
