/**
 * 蛇の移動ロジックのテスト
 */

import { moveSnake, isOppositeDirection, getNextPosition } from '../movement'
import type { Snake, Direction } from '@/lib/types/game'

describe('Movement Logic', () => {
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
  })

  describe('moveSnake', () => {
    it('should move snake to the right', () => {
      const newSnake = moveSnake(snake)
      expect(newSnake.body[0]).toEqual({ x: 11, y: 10 })
      expect(newSnake.body.length).toBe(3)
    })

    it('should move snake to the left', () => {
      snake.direction = 'left'
      snake.nextDirection = 'left'
      snake.body = [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 12, y: 10 },
      ]
      const newSnake = moveSnake(snake)
      expect(newSnake.body[0]).toEqual({ x: 9, y: 10 })
    })

    it('should move snake up', () => {
      snake.direction = 'up'
      snake.nextDirection = 'up'
      const newSnake = moveSnake(snake)
      expect(newSnake.body[0]).toEqual({ x: 10, y: 9 })
    })

    it('should move snake down', () => {
      snake.direction = 'down'
      snake.nextDirection = 'down'
      const newSnake = moveSnake(snake)
      expect(newSnake.body[0]).toEqual({ x: 10, y: 11 })
    })

    it('should update direction from nextDirection', () => {
      snake.nextDirection = 'up'
      const newSnake = moveSnake(snake)
      expect(newSnake.direction).toBe('up')
      expect(newSnake.body[0]).toEqual({ x: 10, y: 9 })
    })

    it('should remove tail when moving', () => {
      const originalTail = snake.body[snake.body.length - 1]
      const newSnake = moveSnake(snake)
      const newTail = newSnake.body[newSnake.body.length - 1]
      expect(newTail).not.toEqual(originalTail)
    })

    it('should grow snake when shouldGrow is true', () => {
      const originalLength = snake.body.length
      const newSnake = moveSnake(snake, true)
      expect(newSnake.body.length).toBe(originalLength + 1)
    })
  })

  describe('isOppositeDirection', () => {
    it('should return true for up and down', () => {
      expect(isOppositeDirection('up', 'down')).toBe(true)
      expect(isOppositeDirection('down', 'up')).toBe(true)
    })

    it('should return true for left and right', () => {
      expect(isOppositeDirection('left', 'right')).toBe(true)
      expect(isOppositeDirection('right', 'left')).toBe(true)
    })

    it('should return false for same direction', () => {
      expect(isOppositeDirection('up', 'up')).toBe(false)
      expect(isOppositeDirection('down', 'down')).toBe(false)
      expect(isOppositeDirection('left', 'left')).toBe(false)
      expect(isOppositeDirection('right', 'right')).toBe(false)
    })

    it('should return false for perpendicular directions', () => {
      expect(isOppositeDirection('up', 'left')).toBe(false)
      expect(isOppositeDirection('up', 'right')).toBe(false)
      expect(isOppositeDirection('down', 'left')).toBe(false)
      expect(isOppositeDirection('down', 'right')).toBe(false)
    })
  })

  describe('getNextPosition', () => {
    const position = { x: 10, y: 10 }

    it('should return correct position for right', () => {
      expect(getNextPosition(position, 'right')).toEqual({ x: 11, y: 10 })
    })

    it('should return correct position for left', () => {
      expect(getNextPosition(position, 'left')).toEqual({ x: 9, y: 10 })
    })

    it('should return correct position for up', () => {
      expect(getNextPosition(position, 'up')).toEqual({ x: 10, y: 9 })
    })

    it('should return correct position for down', () => {
      expect(getNextPosition(position, 'down')).toEqual({ x: 10, y: 11 })
    })
  })
})
