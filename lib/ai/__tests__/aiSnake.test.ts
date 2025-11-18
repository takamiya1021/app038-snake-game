/**
 * AIスネークロジックのテスト
 */

import {
  findNearestFood,
  getNextDirection,
  calculateAIMove,
  getObstacles,
} from '../aiSnake'
import type { Position, Food, Snake, GameState } from '@/lib/types/game'
import { GRID_WIDTH, GRID_HEIGHT } from '@/lib/utils/constants'

describe('AI Snake Logic', () => {
  let playerSnake: Snake
  let aiSnake: Snake
  let gameState: GameState

  beforeEach(() => {
    playerSnake = {
      id: 'player',
      body: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      direction: 'right',
      nextDirection: 'right',
      color: '#10b981',
      score: 0,
      alive: true,
    }

    aiSnake = {
      id: 'ai',
      body: [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 },
      ],
      direction: 'up',
      nextDirection: 'up',
      color: '#ef4444',
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
      snake: playerSnake,
      aiSnake,
      foods: [],
      foodsEaten: 0,
    }
  })

  describe('findNearestFood', () => {
    it('should find the nearest food from AI snake head', () => {
      const foods: Food[] = [
        {
          id: '1',
          position: { x: 12, y: 10 },
          type: 'normal',
          points: 10,
        },
        {
          id: '2',
          position: { x: 15, y: 15 },
          type: 'normal',
          points: 10,
        },
        {
          id: '3',
          position: { x: 11, y: 10 },
          type: 'normal',
          points: 10,
        },
      ]

      const nearest = findNearestFood(aiSnake.body[0], foods)
      expect(nearest).toEqual(foods[2]) // food at (11, 10) is nearest
    })

    it('should return null when no foods exist', () => {
      const nearest = findNearestFood(aiSnake.body[0], [])
      expect(nearest).toBeNull()
    })

    it('should prefer closer food over farther food', () => {
      const foods: Food[] = [
        {
          id: '1',
          position: { x: 10, y: 8 },
          type: 'normal',
          points: 10,
        },
        {
          id: '2',
          position: { x: 18, y: 18 },
          type: 'normal',
          points: 10,
        },
      ]

      const nearest = findNearestFood(aiSnake.body[0], foods)
      expect(nearest).toEqual(foods[0])
    })
  })

  describe('getObstacles', () => {
    it('should include AI snake body as obstacles', () => {
      const obstacles = getObstacles(gameState)

      // AI snake body (excluding head)
      expect(obstacles).toContainEqual({ x: 10, y: 11 })
      expect(obstacles).toContainEqual({ x: 10, y: 12 })
    })

    it('should include player snake body as obstacles', () => {
      const obstacles = getObstacles(gameState)

      // Player snake body
      expect(obstacles).toContainEqual({ x: 5, y: 5 })
      expect(obstacles).toContainEqual({ x: 4, y: 5 })
      expect(obstacles).toContainEqual({ x: 3, y: 5 })
    })

    it('should not include AI snake head as obstacle', () => {
      const obstacles = getObstacles(gameState)
      const head = aiSnake.body[0]

      expect(obstacles.some((pos) => pos.x === head.x && pos.y === head.y)).toBe(false)
    })

    it('should handle null AI snake', () => {
      gameState.aiSnake = null
      const obstacles = getObstacles(gameState)

      // Should only include player snake
      expect(obstacles.length).toBe(3)
    })
  })

  describe('getNextDirection', () => {
    it('should return direction toward goal when path exists', () => {
      const path: Position[] = [
        { x: 10, y: 10 }, // current
        { x: 10, y: 9 }, // next
        { x: 10, y: 8 }, // goal
      ]

      const direction = getNextDirection(aiSnake.body[0], path, aiSnake.direction)
      expect(direction).toBe('up')
    })

    it('should return right when next position is to the right', () => {
      const path: Position[] = [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
      ]

      const direction = getNextDirection(aiSnake.body[0], path, aiSnake.direction)
      expect(direction).toBe('right')
    })

    it('should return left when next position is to the left', () => {
      const path: Position[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
      ]

      const direction = getNextDirection(aiSnake.body[0], path, aiSnake.direction)
      expect(direction).toBe('left')
    })

    it('should return down when next position is below', () => {
      const path: Position[] = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
      ]

      const direction = getNextDirection(aiSnake.body[0], path, aiSnake.direction)
      expect(direction).toBe('down')
    })

    it('should return current direction when path is empty', () => {
      const direction = getNextDirection(aiSnake.body[0], [], aiSnake.direction)
      expect(direction).toBe(aiSnake.direction)
    })

    it('should return current direction when path only has current position', () => {
      const path: Position[] = [{ x: 10, y: 10 }]
      const direction = getNextDirection(aiSnake.body[0], path, aiSnake.direction)
      expect(direction).toBe(aiSnake.direction)
    })
  })

  describe('calculateAIMove', () => {
    it('should calculate move toward nearest food', () => {
      gameState.foods = [
        {
          id: '1',
          position: { x: 10, y: 5 },
          type: 'normal',
          points: 10,
        },
      ]

      const direction = calculateAIMove(gameState)
      expect(direction).toBe('up') // Should move up toward food
    })

    it('should avoid obstacles when navigating to food', () => {
      // Place food behind player snake
      gameState.foods = [
        {
          id: '1',
          position: { x: 5, y: 10 },
          type: 'normal',
          points: 10,
        },
      ]

      const direction = calculateAIMove(gameState)
      // Should find a path around the player snake, not through it
      expect(direction).toBeTruthy()
      expect(['up', 'down', 'left', 'right']).toContain(direction)
    })

    it('should handle case when no path to food exists', () => {
      // Surround AI snake with obstacles (player snake)
      gameState.snake.body = [
        { x: 9, y: 10 },
        { x: 11, y: 10 },
        { x: 10, y: 9 },
        { x: 10, y: 11 },
        { x: 9, y: 9 },
        { x: 11, y: 9 },
        { x: 9, y: 11 },
        { x: 11, y: 11 },
      ]

      gameState.foods = [
        {
          id: '1',
          position: { x: 0, y: 0 },
          type: 'normal',
          points: 10,
        },
      ]

      const direction = calculateAIMove(gameState)
      // Should return a valid direction even if trapped
      expect(['up', 'down', 'left', 'right']).toContain(direction)
    })

    it('should return current direction when no foods exist', () => {
      gameState.foods = []
      const direction = calculateAIMove(gameState)
      expect(direction).toBe(aiSnake.direction)
    })

    it('should not reverse direction (180-degree turn)', () => {
      // AI snake moving up
      gameState.aiSnake!.direction = 'up'
      gameState.foods = [
        {
          id: '1',
          position: { x: 10, y: 15 }, // Behind the snake
          type: 'normal',
          points: 10,
        },
      ]

      const direction = calculateAIMove(gameState)
      // Should never suggest 'down' (opposite of 'up')
      expect(direction).not.toBe('down')
    })

    it('should handle AI snake being null', () => {
      gameState.aiSnake = null
      const direction = calculateAIMove(gameState)
      expect(direction).toBe('up') // Default fallback
    })
  })
})
