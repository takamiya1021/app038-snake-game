/**
 * 衝突判定ロジックのテスト
 */

import {
  isOutOfBounds,
  isSelfCollision,
  wrapPosition,
  checkCollisions,
} from '../collision'
import type { Snake, GameState, Position } from '@/lib/types/game'
import { GRID_WIDTH, GRID_HEIGHT, INITIAL_PLAYER_POSITION } from '@/lib/utils/constants'

describe('Collision Detection', () => {
  let snake: Snake
  let gameState: GameState

  beforeEach(() => {
    snake = {
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
      snake,
      aiSnake: null,
      foods: [],
    }
  })

  describe('isOutOfBounds', () => {
    it('should return true when x is negative', () => {
      const position: Position = { x: -1, y: 10 }
      expect(isOutOfBounds(position, gameState.grid)).toBe(true)
    })

    it('should return true when x is greater than or equal to grid width', () => {
      const position: Position = { x: GRID_WIDTH, y: 10 }
      expect(isOutOfBounds(position, gameState.grid)).toBe(true)
    })

    it('should return true when y is negative', () => {
      const position: Position = { x: 10, y: -1 }
      expect(isOutOfBounds(position, gameState.grid)).toBe(true)
    })

    it('should return true when y is greater than or equal to grid height', () => {
      const position: Position = { x: 10, y: GRID_HEIGHT }
      expect(isOutOfBounds(position, gameState.grid)).toBe(true)
    })

    it('should return false when position is within bounds', () => {
      const position: Position = { x: 10, y: 10 }
      expect(isOutOfBounds(position, gameState.grid)).toBe(false)
    })

    it('should return false for edge positions within bounds', () => {
      expect(isOutOfBounds({ x: 0, y: 0 }, gameState.grid)).toBe(false)
      expect(isOutOfBounds({ x: GRID_WIDTH - 1, y: 0 }, gameState.grid)).toBe(false)
      expect(isOutOfBounds({ x: 0, y: GRID_HEIGHT - 1 }, gameState.grid)).toBe(false)
      expect(isOutOfBounds({ x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 }, gameState.grid)).toBe(false)
    })
  })

  describe('isSelfCollision', () => {
    it('should return false when head does not collide with body', () => {
      expect(isSelfCollision(snake)).toBe(false)
    })

    it('should return true when head collides with body', () => {
      const collidingSnake: Snake = {
        ...snake,
        body: [
          { x: 8, y: 10 }, // 頭が体の一部と同じ位置
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
      }
      expect(isSelfCollision(collidingSnake)).toBe(true)
    })

    it('should return false for a snake with only one segment', () => {
      const singleSegmentSnake: Snake = {
        ...snake,
        body: [{ x: 10, y: 10 }],
      }
      expect(isSelfCollision(singleSegmentSnake)).toBe(false)
    })

    it('should return true when head collides with middle of body', () => {
      const longSnake: Snake = {
        ...snake,
        body: [
          { x: 10, y: 10 }, // 頭
          { x: 9, y: 10 },
          { x: 8, y: 10 },
          { x: 8, y: 11 },
          { x: 9, y: 11 },
          { x: 10, y: 11 },
          { x: 10, y: 10 }, // 頭と同じ位置
        ],
      }
      expect(isSelfCollision(longSnake)).toBe(true)
    })
  })

  describe('wrapPosition', () => {
    it('should wrap x position when less than 0', () => {
      const position: Position = { x: -1, y: 10 }
      const wrapped = wrapPosition(position, gameState.grid)
      expect(wrapped.x).toBe(GRID_WIDTH - 1)
      expect(wrapped.y).toBe(10)
    })

    it('should wrap x position when greater than or equal to grid width', () => {
      const position: Position = { x: GRID_WIDTH, y: 10 }
      const wrapped = wrapPosition(position, gameState.grid)
      expect(wrapped.x).toBe(0)
      expect(wrapped.y).toBe(10)
    })

    it('should wrap y position when less than 0', () => {
      const position: Position = { x: 10, y: -1 }
      const wrapped = wrapPosition(position, gameState.grid)
      expect(wrapped.x).toBe(10)
      expect(wrapped.y).toBe(GRID_HEIGHT - 1)
    })

    it('should wrap y position when greater than or equal to grid height', () => {
      const position: Position = { x: 10, y: GRID_HEIGHT }
      const wrapped = wrapPosition(position, gameState.grid)
      expect(wrapped.x).toBe(10)
      expect(wrapped.y).toBe(0)
    })

    it('should not change position when within bounds', () => {
      const position: Position = { x: 10, y: 10 }
      const wrapped = wrapPosition(position, gameState.grid)
      expect(wrapped).toEqual(position)
    })
  })

  describe('checkCollisions', () => {
    it('should set game over when hitting wall in classic mode', () => {
      gameState.snake.body[0] = { x: -1, y: 10 }
      const result = checkCollisions(gameState)
      expect(result.status).toBe('gameOver')
      expect(result.snake.alive).toBe(false)
    })

    it('should not game over when hitting wall in endless mode', () => {
      gameState.mode = 'endless'
      gameState.snake.body[0] = { x: -1, y: 10 }
      const result = checkCollisions(gameState)
      expect(result.status).toBe('playing')
      expect(result.snake.alive).toBe(true)
    })

    it('should wrap position in endless mode', () => {
      gameState.mode = 'endless'
      gameState.snake.body[0] = { x: GRID_WIDTH, y: 10 }
      const result = checkCollisions(gameState)
      expect(result.snake.body[0].x).toBe(0)
      expect(result.snake.body[0].y).toBe(10)
    })

    it('should set game over when snake collides with itself in classic mode', () => {
      gameState.snake.body = [
        { x: 8, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ]
      const result = checkCollisions(gameState)
      expect(result.status).toBe('gameOver')
      expect(result.snake.alive).toBe(false)
    })

    it('should shrink snake when colliding with itself in endless mode', () => {
      gameState.mode = 'endless'
      gameState.snake.body = [
        { x: 8, y: 10 },
        { x: 9, y: 10 },
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 12, y: 10 },
        { x: 8, y: 10 },
      ]
      const originalLength = gameState.snake.body.length
      const result = checkCollisions(gameState)
      expect(result.snake.body.length).toBe(Math.max(3, originalLength - 3))
      expect(result.status).toBe('playing')
    })

    it('should not change state when no collision', () => {
      const result = checkCollisions(gameState)
      expect(result.status).toBe('playing')
      expect(result.snake.alive).toBe(true)
      expect(result.snake.body).toEqual(gameState.snake.body)
    })
  })
})
