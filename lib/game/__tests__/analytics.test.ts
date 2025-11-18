/**
 * プレイ分析ロジックのテスト
 */

import {
  collectPlayData,
  calculateScoreEfficiency,
  calculateAvgScorePerFood,
  determineDeathCause,
} from '../analytics'
import type { GameState, Snake } from '@/lib/types/game'
import { GRID_WIDTH, GRID_HEIGHT } from '@/lib/utils/constants'

describe('Play Analytics', () => {
  let baseGameState: GameState

  beforeEach(() => {
    const playerSnake: Snake = {
      id: 'player',
      body: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      direction: 'right',
      nextDirection: 'right',
      color: '#10b981',
      score: 100,
      alive: false,
    }

    baseGameState = {
      mode: 'classic',
      difficulty: 'easy',
      status: 'gameOver',
      score: 100,
      level: 3,
      speed: 1.4,
      timeLeft: 0,
      grid: {
        width: GRID_WIDTH,
        height: GRID_HEIGHT,
      },
      snake: playerSnake,
      aiSnake: null,
      foods: [],
      foodsEaten: 0,
    }
  })

  describe('determineDeathCause', () => {
    it('should return wall when snake hit wall', () => {
      const snake: Snake = {
        ...baseGameState.snake,
        body: [
          { x: -1, y: 5 }, // 壁外
          { x: 0, y: 5 },
        ],
      }

      const cause = determineDeathCause({ ...baseGameState, snake }, snake)
      expect(cause).toBe('wall')
    })

    it('should return self when snake hit itself', () => {
      const snake: Snake = {
        ...baseGameState.snake,
        body: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
          { x: 3, y: 6 },
          { x: 4, y: 6 },
          { x: 5, y: 6 },
          { x: 5, y: 5 }, // 自分に衝突
        ],
      }

      const cause = determineDeathCause({ ...baseGameState, snake }, snake)
      expect(cause).toBe('self')
    })

    it('should return ai when snake is alive in AI battle', () => {
      const aiSnake: Snake = {
        id: 'ai',
        body: [{ x: 10, y: 10 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 120,
        alive: true,
      }

      const gameState = {
        ...baseGameState,
        mode: 'aiBattle' as const,
        aiSnake,
      }

      const cause = determineDeathCause(gameState, baseGameState.snake)
      expect(cause).toBe('ai')
    })

    it('should return null when snake is still alive', () => {
      const snake: Snake = {
        ...baseGameState.snake,
        alive: true,
      }

      const cause = determineDeathCause({ ...baseGameState, snake }, snake)
      expect(cause).toBeNull()
    })
  })

  describe('calculateScoreEfficiency', () => {
    it('should calculate score per second correctly', () => {
      const score = 100
      const survivalTime = 20000 // 20秒

      const efficiency = calculateScoreEfficiency(score, survivalTime)
      expect(efficiency).toBe(5) // 100 / 20 = 5点/秒
    })

    it('should return 0 when survival time is 0', () => {
      const efficiency = calculateScoreEfficiency(100, 0)
      expect(efficiency).toBe(0)
    })

    it('should handle decimal values correctly', () => {
      const score = 150
      const survivalTime = 7000 // 7秒

      const efficiency = calculateScoreEfficiency(score, survivalTime)
      expect(efficiency).toBeCloseTo(21.43, 1) // 150 / 7 ≈ 21.43
    })
  })

  describe('calculateAvgScorePerFood', () => {
    it('should calculate average score per food correctly', () => {
      const score = 100
      const foodsEaten = 10

      const avg = calculateAvgScorePerFood(score, foodsEaten)
      expect(avg).toBe(10) // 100 / 10 = 10点/餌
    })

    it('should return 0 when no foods eaten', () => {
      const avg = calculateAvgScorePerFood(100, 0)
      expect(avg).toBe(0)
    })

    it('should handle decimal values correctly', () => {
      const score = 150
      const foodsEaten = 7

      const avg = calculateAvgScorePerFood(score, foodsEaten)
      expect(avg).toBeCloseTo(21.43, 1) // 150 / 7 ≈ 21.43
    })
  })

  describe('collectPlayData', () => {
    it('should collect all play data correctly', () => {
      const startTime = Date.now() - 30000 // 30秒前
      const foodsEaten = 10

      baseGameState.foodsEaten = foodsEaten
      const playData = collectPlayData(baseGameState, startTime)

      expect(playData).toMatchObject({
        finalScore: 100,
        finalLevel: 3,
        foodsEaten: 10,
        mode: 'classic',
        difficulty: 'easy',
      })

      expect(playData.survivalTime).toBeGreaterThan(29000)
      expect(playData.survivalTime).toBeLessThan(31000)
      expect(playData.scoreEfficiency).toBeGreaterThan(0)
      expect(playData.avgScorePerFood).toBe(10)
    })

    it('should include death cause in play data', () => {
      const snake: Snake = {
        ...baseGameState.snake,
        body: [
          { x: GRID_WIDTH, y: 5 }, // 壁外
          { x: GRID_WIDTH - 1, y: 5 },
        ],
      }

      const gameState = { ...baseGameState, snake }
      const playData = collectPlayData(
        { ...gameState, foodsEaten: 5 },
        Date.now() - 10000
      )

      expect(playData.deathCause).toBe('wall')
    })

    it('should handle AI battle mode correctly', () => {
      const aiSnake: Snake = {
        id: 'ai',
        body: [{ x: 10, y: 10 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 120,
        alive: true,
      }

      const gameState = {
        ...baseGameState,
        mode: 'aiBattle' as const,
        aiSnake,
      }

      const playData = collectPlayData(
        { ...gameState, foodsEaten: 8 },
        Date.now() - 15000
      )

      expect(playData.mode).toBe('aiBattle')
      expect(playData.deathCause).toBe('ai')
    })

    it('should calculate correct efficiency for short games', () => {
      const startTime = Date.now() - 5000 // 5秒前
      baseGameState.foodsEaten = 10
      const playData = collectPlayData(baseGameState, startTime)

      expect(playData.scoreEfficiency).toBeGreaterThan(15) // 100 / 5 = 20点/秒前後
    })

    it('should handle zero foods eaten', () => {
      baseGameState.foodsEaten = 0
      const playData = collectPlayData(baseGameState, Date.now() - 10000)

      expect(playData.foodsEaten).toBe(0)
      expect(playData.avgScorePerFood).toBe(0)
    })
  })
})
