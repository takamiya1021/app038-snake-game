/**
 * レベルアップロジックのテスト
 */

import { checkLevelUp, calculateSpeed } from '../level'
import type { GameState } from '@/lib/types/game'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  SCORE_PER_LEVEL,
  SPEED_INCREASE_PER_LEVEL,
  MAX_LEVEL,
  MAX_SPEED,
} from '@/lib/utils/constants'

describe('Level Up Logic', () => {
  let gameState: GameState

  beforeEach(() => {
    gameState = {
      mode: 'classic',
      difficulty: 'easy',
      status: 'playing',
      score: 0,
      level: 1,
      speed: 1.0,
      timeLeft: 0,
      grid: {
        width: GRID_WIDTH,
        height: GRID_HEIGHT,
      },
      snake: {
        id: 'player',
        body: [{ x: 10, y: 10 }],
        direction: 'right',
        nextDirection: 'right',
        color: '#10b981',
        score: 0,
        alive: true,
      },
      aiSnake: null,
      foods: [],
    }
  })

  describe('checkLevelUp', () => {
    it('should not level up when score is below threshold', () => {
      gameState.score = SCORE_PER_LEVEL - 1
      const result = checkLevelUp(gameState)
      expect(result.level).toBe(1)
      expect(result.speed).toBe(1.0)
    })

    it('should level up when score reaches threshold', () => {
      gameState.score = SCORE_PER_LEVEL
      const result = checkLevelUp(gameState)
      expect(result.level).toBe(2)
      expect(result.speed).toBeGreaterThan(1.0)
    })

    it('should increase speed when leveling up', () => {
      gameState.score = SCORE_PER_LEVEL
      const result = checkLevelUp(gameState)
      expect(result.speed).toBe(1.0 + SPEED_INCREASE_PER_LEVEL)
    })

    it('should level up multiple times for high scores', () => {
      gameState.score = SCORE_PER_LEVEL * 3
      const result = checkLevelUp(gameState)
      expect(result.level).toBe(4)
    })

    it('should not exceed max level', () => {
      gameState.score = SCORE_PER_LEVEL * 100
      const result = checkLevelUp(gameState)
      expect(result.level).toBeLessThanOrEqual(MAX_LEVEL)
    })

    it('should not exceed max speed', () => {
      gameState.score = SCORE_PER_LEVEL * 100
      const result = checkLevelUp(gameState)
      expect(result.speed).toBeLessThanOrEqual(MAX_SPEED)
    })

    it('should set leveledUp flag when level increases', () => {
      gameState.score = SCORE_PER_LEVEL
      const result = checkLevelUp(gameState)
      expect(result.leveledUp).toBe(true)
    })

    it('should not set leveledUp flag when level stays same', () => {
      gameState.score = SCORE_PER_LEVEL - 1
      const result = checkLevelUp(gameState)
      expect(result.leveledUp).toBe(false)
    })

    it('should handle edge case at exact level boundary', () => {
      gameState.score = SCORE_PER_LEVEL * 2
      const result = checkLevelUp(gameState)
      expect(result.level).toBe(3)
    })
  })

  describe('calculateSpeed', () => {
    it('should return base speed for level 1', () => {
      expect(calculateSpeed(1)).toBe(1.0)
    })

    it('should increase speed for higher levels', () => {
      expect(calculateSpeed(2)).toBe(1.0 + SPEED_INCREASE_PER_LEVEL)
      expect(calculateSpeed(3)).toBe(1.0 + SPEED_INCREASE_PER_LEVEL * 2)
    })

    it('should not exceed max speed', () => {
      expect(calculateSpeed(100)).toBe(MAX_SPEED)
    })

    it('should cap at max speed for max level', () => {
      expect(calculateSpeed(MAX_LEVEL)).toBeLessThanOrEqual(MAX_SPEED)
    })

    it('should handle level 0 gracefully', () => {
      expect(calculateSpeed(0)).toBe(1.0)
    })

    it('should handle negative levels gracefully', () => {
      expect(calculateSpeed(-1)).toBe(1.0)
    })
  })
})
