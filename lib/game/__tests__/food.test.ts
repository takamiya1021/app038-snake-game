/**
 * 餌生成ロジックのテスト
 */

import { generateFood, generateRandomPosition, isFoodPositionValid } from '../food'
import type { Position, Food, Snake } from '@/lib/types/game'
import { GRID_WIDTH, GRID_HEIGHT, NORMAL_FOOD_POINTS } from '@/lib/utils/constants'

describe('Food Generation', () => {
  let snake: Snake
  let occupiedPositions: Position[]

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
    occupiedPositions = [...snake.body]
  })

  describe('generateRandomPosition', () => {
    it('should generate a position within grid bounds', () => {
      const position = generateRandomPosition(GRID_WIDTH, GRID_HEIGHT)
      expect(position.x).toBeGreaterThanOrEqual(0)
      expect(position.x).toBeLessThan(GRID_WIDTH)
      expect(position.y).toBeGreaterThanOrEqual(0)
      expect(position.y).toBeLessThan(GRID_HEIGHT)
    })

    it('should generate different positions on multiple calls', () => {
      const positions = new Set<string>()
      for (let i = 0; i < 100; i++) {
        const pos = generateRandomPosition(GRID_WIDTH, GRID_HEIGHT)
        positions.add(`${pos.x},${pos.y}`)
      }
      // 100回の生成で少なくとも10個以上の異なる位置が生成されることを期待
      expect(positions.size).toBeGreaterThan(10)
    })
  })

  describe('isFoodPositionValid', () => {
    it('should return true when position is not occupied', () => {
      const position: Position = { x: 15, y: 15 }
      expect(isFoodPositionValid(position, occupiedPositions)).toBe(true)
    })

    it('should return false when position is occupied by snake', () => {
      const position: Position = { x: 10, y: 10 }
      expect(isFoodPositionValid(position, occupiedPositions)).toBe(false)
    })

    it('should return false for all snake body positions', () => {
      for (const pos of snake.body) {
        expect(isFoodPositionValid(pos, occupiedPositions)).toBe(false)
      }
    })
  })

  describe('generateFood', () => {
    it('should generate a normal food with correct properties', () => {
      const food = generateFood(GRID_WIDTH, GRID_HEIGHT, occupiedPositions, 'normal')
      expect(food.type).toBe('normal')
      expect(food.points).toBe(NORMAL_FOOD_POINTS)
      expect(food.id).toBeTruthy()
      expect(food.position).toBeDefined()
    })

    it('should generate food at a valid position', () => {
      const food = generateFood(GRID_WIDTH, GRID_HEIGHT, occupiedPositions, 'normal')
      expect(isFoodPositionValid(food.position, occupiedPositions)).toBe(true)
    })

    it('should generate food not overlapping with snake', () => {
      const food = generateFood(GRID_WIDTH, GRID_HEIGHT, occupiedPositions, 'normal')
      const overlaps = snake.body.some(
        (segment) => segment.x === food.position.x && segment.y === food.position.y
      )
      expect(overlaps).toBe(false)
    })

    it('should generate special food with correct properties', () => {
      const food = generateFood(GRID_WIDTH, GRID_HEIGHT, occupiedPositions, 'speedBoost')
      expect(food.type).toBe('speedBoost')
      expect(food.points).toBeGreaterThan(NORMAL_FOOD_POINTS)
      expect(food.effect).toBeDefined()
    })

    it('should generate food with unique ID', () => {
      const food1 = generateFood(GRID_WIDTH, GRID_HEIGHT, occupiedPositions, 'normal')
      const food2 = generateFood(GRID_WIDTH, GRID_HEIGHT, occupiedPositions, 'normal')
      expect(food1.id).not.toBe(food2.id)
    })

    it('should generate score double food with correct effect', () => {
      const food = generateFood(GRID_WIDTH, GRID_HEIGHT, occupiedPositions, 'scoreDouble')
      expect(food.type).toBe('scoreDouble')
      expect(food.effect?.type).toBe('score')
      expect(food.effect?.multiplier).toBe(2)
    })

    it('should generate shrink food with correct effect', () => {
      const food = generateFood(GRID_WIDTH, GRID_HEIGHT, occupiedPositions, 'shrink')
      expect(food.type).toBe('shrink')
      expect(food.effect?.type).toBe('shrink')
    })

    it('should handle empty grid (no occupied positions)', () => {
      const food = generateFood(GRID_WIDTH, GRID_HEIGHT, [], 'normal')
      expect(food.position.x).toBeGreaterThanOrEqual(0)
      expect(food.position.x).toBeLessThan(GRID_WIDTH)
      expect(food.position.y).toBeGreaterThanOrEqual(0)
      expect(food.position.y).toBeLessThan(GRID_HEIGHT)
    })
  })
})
