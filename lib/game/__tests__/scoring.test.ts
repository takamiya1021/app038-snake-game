/**
 * スコア計算ロジックのテスト
 */

import { addScore, checkFoodCollision } from '../scoring'
import type { GameState, Food, Snake } from '@/lib/types/game'
import { GRID_WIDTH, GRID_HEIGHT, NORMAL_FOOD_POINTS, SPECIAL_FOOD_POINTS } from '@/lib/utils/constants'

describe('Scoring Logic', () => {
  let gameState: GameState
  let snake: Snake

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
      score: 100,
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

  describe('addScore', () => {
    it('should add points to game score', () => {
      const result = addScore(gameState, 50)
      expect(result.score).toBe(150)
    })

    it('should add points to snake score', () => {
      const result = addScore(gameState, 50)
      expect(result.snake.score).toBe(50)
    })

    it('should handle zero points', () => {
      const result = addScore(gameState, 0)
      expect(result.score).toBe(100)
      expect(result.snake.score).toBe(0)
    })

    it('should accumulate scores correctly', () => {
      let result = addScore(gameState, 10)
      result = addScore(result, 20)
      result = addScore(result, 30)
      expect(result.score).toBe(160)
      expect(result.snake.score).toBe(60)
    })
  })

  describe('checkFoodCollision', () => {
    let normalFood: Food
    let specialFood: Food

    beforeEach(() => {
      normalFood = {
        id: 'food-1',
        position: { x: 11, y: 10 }, // 蛇の進行方向にある
        type: 'normal',
        points: NORMAL_FOOD_POINTS,
      }

      specialFood = {
        id: 'food-2',
        position: { x: 12, y: 10 },
        type: 'scoreDouble',
        points: SPECIAL_FOOD_POINTS,
        effect: {
          type: 'score',
          duration: 10,
          multiplier: 2,
        },
        expiresAt: Date.now() + 30000,
      }

      gameState.foods = [normalFood, specialFood]
    })

    it('should detect collision with food', () => {
      // 蛇を餌の位置に移動
      gameState.snake.body[0] = { x: 11, y: 10 }
      const result = checkFoodCollision(gameState)

      // 餌が削除されているはず
      expect(result.foods.length).toBe(1)
      expect(result.foods[0].id).toBe('food-2')
    })

    it('should add score when eating food', () => {
      gameState.snake.body[0] = { x: 11, y: 10 }
      const result = checkFoodCollision(gameState)

      expect(result.score).toBe(gameState.score + NORMAL_FOOD_POINTS)
    })

    it('should grow snake when eating food', () => {
      const originalLength = gameState.snake.body.length
      gameState.snake.body[0] = { x: 11, y: 10 }
      const result = checkFoodCollision(gameState)

      expect(result.snake.body.length).toBe(originalLength + 1)
    })

    it('should not change state when no collision', () => {
      gameState.snake.body[0] = { x: 5, y: 5 }
      const result = checkFoodCollision(gameState)

      expect(result.foods.length).toBe(2)
      expect(result.score).toBe(gameState.score)
      expect(result.snake.body.length).toBe(gameState.snake.body.length)
    })

    it('should add special food points', () => {
      gameState.snake.body[0] = { x: 12, y: 10 }
      const result = checkFoodCollision(gameState)

      expect(result.score).toBe(gameState.score + SPECIAL_FOOD_POINTS)
    })

    it('should handle multiple foods on grid', () => {
      gameState.foods = [
        { ...normalFood, position: { x: 11, y: 10 } },
        { ...normalFood, id: 'food-3', position: { x: 15, y: 15 } },
        { ...normalFood, id: 'food-4', position: { x: 5, y: 5 } },
      ]

      gameState.snake.body[0] = { x: 11, y: 10 }
      const result = checkFoodCollision(gameState)

      // 1つの餌だけが削除される
      expect(result.foods.length).toBe(2)
    })

    it('should set shouldGrow flag when eating food', () => {
      gameState.snake.body[0] = { x: 11, y: 10 }
      const result = checkFoodCollision(gameState)

      // 蛇が成長しているはず（body lengthが1増加）
      expect(result.snake.body.length).toBe(gameState.snake.body.length + 1)
    })
  })
})
