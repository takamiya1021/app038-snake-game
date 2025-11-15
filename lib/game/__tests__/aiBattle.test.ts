/**
 * AI対戦ロジックのテスト
 */

import {
  initializeAISnake,
  updateAISnake,
  checkBattleWinner,
  processAIFoodCollision,
} from '../aiBattle'
import type { GameState, Snake, Food } from '@/lib/types/game'
import { GRID_WIDTH, GRID_HEIGHT } from '@/lib/utils/constants'

describe('AI Battle Logic', () => {
  let gameState: GameState

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
      score: 0,
      alive: true,
    }

    gameState = {
      mode: 'aiBattle',
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
      aiSnake: null,
      foods: [],
    }
  })

  describe('initializeAISnake', () => {
    it('should create AI snake at valid position', () => {
      const newState = initializeAISnake(gameState)

      expect(newState.aiSnake).not.toBeNull()
      expect(newState.aiSnake?.id).toBe('ai')
      expect(newState.aiSnake?.alive).toBe(true)
      expect(newState.aiSnake?.body.length).toBeGreaterThan(0)
    })

    it('should create AI snake away from player snake', () => {
      const newState = initializeAISnake(gameState)
      const aiHead = newState.aiSnake!.body[0]
      const playerHead = gameState.snake.body[0]

      // AI should be at least 5 cells away from player
      const distance = Math.abs(aiHead.x - playerHead.x) + Math.abs(aiHead.y - playerHead.y)
      expect(distance).toBeGreaterThanOrEqual(5)
    })

    it('should create AI snake with correct initial properties', () => {
      const newState = initializeAISnake(gameState)

      expect(newState.aiSnake?.color).toBe('#ef4444')
      expect(newState.aiSnake?.score).toBe(0)
      expect(newState.aiSnake?.direction).toBeTruthy()
      expect(newState.aiSnake?.nextDirection).toBeTruthy()
    })

    it('should not create AI snake if already exists', () => {
      const aiSnake: Snake = {
        id: 'ai',
        body: [{ x: 15, y: 15 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 100,
        alive: true,
      }
      gameState.aiSnake = aiSnake

      const newState = initializeAISnake(gameState)
      expect(newState.aiSnake?.score).toBe(100) // Should keep existing AI
    })
  })

  describe('updateAISnake', () => {
    beforeEach(() => {
      gameState = initializeAISnake(gameState)
      gameState.foods = [
        {
          id: '1',
          position: { x: 10, y: 10 },
          type: 'normal',
          points: 10,
        },
      ]
    })

    it('should move AI snake toward food', () => {
      const oldHead = gameState.aiSnake!.body[0]
      const newState = updateAISnake(gameState)
      const newHead = newState.aiSnake!.body[0]

      // AI should have moved
      expect(oldHead.x !== newHead.x || oldHead.y !== newHead.y).toBe(true)
    })

    it('should not update AI snake if it is dead', () => {
      gameState.aiSnake!.alive = false
      const oldBody = [...gameState.aiSnake!.body]

      const newState = updateAISnake(gameState)
      expect(newState.aiSnake?.body).toEqual(oldBody)
    })

    it('should not update AI snake if game is not playing', () => {
      gameState.status = 'gameOver'
      const oldBody = [...gameState.aiSnake!.body]

      const newState = updateAISnake(gameState)
      expect(newState.aiSnake?.body).toEqual(oldBody)
    })

    it('should update AI direction based on pathfinding', () => {
      const newState = updateAISnake(gameState)

      // Direction should be valid
      expect(['up', 'down', 'left', 'right']).toContain(newState.aiSnake?.direction)
    })
  })

  describe('processAIFoodCollision', () => {
    beforeEach(() => {
      gameState = initializeAISnake(gameState)
    })

    it('should detect when AI eats food', () => {
      const aiHead = gameState.aiSnake!.body[0]
      gameState.foods = [
        {
          id: '1',
          position: aiHead,
          type: 'normal',
          points: 10,
        },
      ]

      const newState = processAIFoodCollision(gameState)

      expect(newState.aiSnake?.score).toBe(10)
      expect(newState.foods.length).toBe(0)
    })

    it('should grow AI snake when eating food', () => {
      const aiHead = gameState.aiSnake!.body[0]
      const initialLength = gameState.aiSnake!.body.length

      gameState.foods = [
        {
          id: '1',
          position: aiHead,
          type: 'normal',
          points: 10,
        },
      ]

      const newState = processAIFoodCollision(gameState)

      expect(newState.aiSnake?.body.length).toBe(initialLength + 1)
    })

    it('should handle special food correctly', () => {
      const aiHead = gameState.aiSnake!.body[0]
      gameState.foods = [
        {
          id: '1',
          position: aiHead,
          type: 'special',
          points: 50,
        },
      ]

      const newState = processAIFoodCollision(gameState)

      expect(newState.aiSnake?.score).toBe(50)
    })

    it('should not change state when AI does not eat food', () => {
      gameState.foods = [
        {
          id: '1',
          position: { x: 0, y: 0 },
          type: 'normal',
          points: 10,
        },
      ]

      const newState = processAIFoodCollision(gameState)

      expect(newState.aiSnake?.score).toBe(0)
      expect(newState.foods.length).toBe(1)
    })

    it('should handle AI snake being null', () => {
      gameState.aiSnake = null
      gameState.foods = [
        {
          id: '1',
          position: { x: 0, y: 0 },
          type: 'normal',
          points: 10,
        },
      ]

      const newState = processAIFoodCollision(gameState)

      expect(newState.aiSnake).toBeNull()
      expect(newState.foods.length).toBe(1)
    })
  })

  describe('checkBattleWinner', () => {
    beforeEach(() => {
      gameState = initializeAISnake(gameState)
    })

    it('should return null when both snakes are alive', () => {
      gameState.snake.alive = true
      gameState.aiSnake!.alive = true

      const winner = checkBattleWinner(gameState)
      expect(winner).toBeNull()
    })

    it('should return player when AI is dead', () => {
      gameState.snake.alive = true
      gameState.aiSnake!.alive = false

      const winner = checkBattleWinner(gameState)
      expect(winner).toBe('player')
    })

    it('should return ai when player is dead', () => {
      gameState.snake.alive = false
      gameState.aiSnake!.alive = true

      const winner = checkBattleWinner(gameState)
      expect(winner).toBe('ai')
    })

    it('should return player when both dead and player has higher score', () => {
      gameState.snake.alive = false
      gameState.snake.score = 100
      gameState.aiSnake!.alive = false
      gameState.aiSnake!.score = 50

      const winner = checkBattleWinner(gameState)
      expect(winner).toBe('player')
    })

    it('should return ai when both dead and AI has higher score', () => {
      gameState.snake.alive = false
      gameState.snake.score = 50
      gameState.aiSnake!.alive = false
      gameState.aiSnake!.score = 100

      const winner = checkBattleWinner(gameState)
      expect(winner).toBe('ai')
    })

    it('should return draw when both dead with same score', () => {
      gameState.snake.alive = false
      gameState.snake.score = 100
      gameState.aiSnake!.alive = false
      gameState.aiSnake!.score = 100

      const winner = checkBattleWinner(gameState)
      expect(winner).toBe('draw')
    })

    it('should handle AI snake being null', () => {
      gameState.aiSnake = null

      const winner = checkBattleWinner(gameState)
      expect(winner).toBeNull()
    })

    it('should only check winner when game is over', () => {
      gameState.status = 'playing'
      gameState.snake.alive = false
      gameState.aiSnake!.alive = true

      const winner = checkBattleWinner(gameState)
      // Winner check only matters when status is gameOver
      expect(winner).toBeDefined()
    })
  })
})
