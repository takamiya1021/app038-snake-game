/**
 * A*経路探索アルゴリズムのテスト
 */

import { findPath, manhattanDistance, getNeighbors, reconstructPath } from '../pathfinding'
import type { Position } from '@/lib/types/game'
import { GRID_WIDTH, GRID_HEIGHT } from '@/lib/utils/constants'

describe('A* Pathfinding', () => {
  describe('manhattanDistance', () => {
    it('should calculate correct distance for same position', () => {
      const pos = { x: 5, y: 5 }
      expect(manhattanDistance(pos, pos)).toBe(0)
    })

    it('should calculate correct horizontal distance', () => {
      const start = { x: 0, y: 5 }
      const end = { x: 10, y: 5 }
      expect(manhattanDistance(start, end)).toBe(10)
    })

    it('should calculate correct vertical distance', () => {
      const start = { x: 5, y: 0 }
      const end = { x: 5, y: 10 }
      expect(manhattanDistance(start, end)).toBe(10)
    })

    it('should calculate correct diagonal distance', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 3, y: 4 }
      expect(manhattanDistance(start, end)).toBe(7)
    })
  })

  describe('getNeighbors', () => {
    it('should return 4 neighbors for middle position', () => {
      const pos = { x: 5, y: 5 }
      const neighbors = getNeighbors(pos, GRID_WIDTH, GRID_HEIGHT)
      expect(neighbors.length).toBe(4)
    })

    it('should return correct neighbor positions', () => {
      const pos = { x: 5, y: 5 }
      const neighbors = getNeighbors(pos, GRID_WIDTH, GRID_HEIGHT)
      expect(neighbors).toContainEqual({ x: 5, y: 4 }) // up
      expect(neighbors).toContainEqual({ x: 5, y: 6 }) // down
      expect(neighbors).toContainEqual({ x: 4, y: 5 }) // left
      expect(neighbors).toContainEqual({ x: 6, y: 5 }) // right
    })

    it('should return only 2 neighbors for corner position', () => {
      const pos = { x: 0, y: 0 }
      const neighbors = getNeighbors(pos, GRID_WIDTH, GRID_HEIGHT)
      expect(neighbors.length).toBe(2)
      expect(neighbors).toContainEqual({ x: 1, y: 0 }) // right
      expect(neighbors).toContainEqual({ x: 0, y: 1 }) // down
    })

    it('should not return out-of-bounds neighbors', () => {
      const pos = { x: 0, y: 0 }
      const neighbors = getNeighbors(pos, GRID_WIDTH, GRID_HEIGHT)
      expect(neighbors.every((n) => n.x >= 0 && n.y >= 0)).toBe(true)
    })
  })

  describe('findPath', () => {
    it('should find direct path with no obstacles', () => {
      const start = { x: 0, y: 0 }
      const goal = { x: 3, y: 0 }
      const obstacles: Position[] = []

      const path = findPath(start, goal, obstacles, GRID_WIDTH, GRID_HEIGHT)

      expect(path.length).toBeGreaterThan(0)
      expect(path[0]).toEqual(start)
      expect(path[path.length - 1]).toEqual(goal)
    })

    it('should find path around obstacles', () => {
      const start = { x: 0, y: 0 }
      const goal = { x: 2, y: 0 }
      const obstacles: Position[] = [{ x: 1, y: 0 }] // Block direct path

      const path = findPath(start, goal, obstacles, GRID_WIDTH, GRID_HEIGHT)

      expect(path.length).toBeGreaterThan(0)
      expect(path[0]).toEqual(start)
      expect(path[path.length - 1]).toEqual(goal)
      // Path should not contain obstacle
      expect(path.some((p) => p.x === 1 && p.y === 0)).toBe(false)
    })

    it('should return empty array when no path exists', () => {
      const start = { x: 0, y: 0 }
      const goal = { x: 2, y: 0 }
      // Completely block the path
      const obstacles: Position[] = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ]

      const path = findPath(start, goal, obstacles, 3, 2)

      expect(path.length).toBe(0)
    })

    it('should return single position when start equals goal', () => {
      const start = { x: 5, y: 5 }
      const goal = { x: 5, y: 5 }
      const obstacles: Position[] = []

      const path = findPath(start, goal, obstacles, GRID_WIDTH, GRID_HEIGHT)

      expect(path.length).toBe(1)
      expect(path[0]).toEqual(start)
    })

    it('should find shortest path among multiple options', () => {
      const start = { x: 0, y: 0 }
      const goal = { x: 2, y: 2 }
      const obstacles: Position[] = []

      const path = findPath(start, goal, obstacles, GRID_WIDTH, GRID_HEIGHT)

      // Shortest path should be 5 steps (manhattan distance is 4, plus start position)
      expect(path.length).toBe(5)
    })

    it('should handle large grid efficiently', () => {
      const start = { x: 0, y: 0 }
      const goal = { x: 15, y: 15 }
      const obstacles: Position[] = []

      const startTime = Date.now()
      const path = findPath(start, goal, obstacles, GRID_WIDTH, GRID_HEIGHT)
      const endTime = Date.now()

      expect(path.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(100) // Should complete in less than 100ms
    })
  })
})
