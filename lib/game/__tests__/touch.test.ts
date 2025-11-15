/**
 * タッチ・スワイプ検出ロジックのテスト
 */

import {
  detectSwipeDirection,
  getTouchCoordinates,
  calculateSwipeDistance,
} from '../touch'
import type { Direction } from '@/lib/types/game'

describe('Touch & Swipe Detection', () => {
  describe('calculateSwipeDistance', () => {
    it('should calculate horizontal distance correctly', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 200, y: 100 }

      const distance = calculateSwipeDistance(start, end)
      expect(distance.x).toBe(100)
      expect(distance.y).toBe(0)
    })

    it('should calculate vertical distance correctly', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 100, y: 50 }

      const distance = calculateSwipeDistance(start, end)
      expect(distance.x).toBe(0)
      expect(distance.y).toBe(-50)
    })

    it('should calculate diagonal distance correctly', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 30, y: 40 }

      const distance = calculateSwipeDistance(start, end)
      expect(distance.x).toBe(30)
      expect(distance.y).toBe(40)
    })
  })

  describe('detectSwipeDirection', () => {
    const MIN_SWIPE_DISTANCE = 30

    it('should detect swipe right', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 150, y: 100 }

      const direction = detectSwipeDirection(start, end, MIN_SWIPE_DISTANCE)
      expect(direction).toBe('right')
    })

    it('should detect swipe left', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 50, y: 100 }

      const direction = detectSwipeDirection(start, end, MIN_SWIPE_DISTANCE)
      expect(direction).toBe('left')
    })

    it('should detect swipe up', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 100, y: 50 }

      const direction = detectSwipeDirection(start, end, MIN_SWIPE_DISTANCE)
      expect(direction).toBe('up')
    })

    it('should detect swipe down', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 100, y: 150 }

      const direction = detectSwipeDirection(start, end, MIN_SWIPE_DISTANCE)
      expect(direction).toBe('down')
    })

    it('should return null for short swipe distance', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 110, y: 105 }

      const direction = detectSwipeDirection(start, end, MIN_SWIPE_DISTANCE)
      expect(direction).toBeNull()
    })

    it('should detect primary direction for diagonal swipe (more horizontal)', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 180, y: 120 }

      const direction = detectSwipeDirection(start, end, MIN_SWIPE_DISTANCE)
      expect(direction).toBe('right')
    })

    it('should detect primary direction for diagonal swipe (more vertical)', () => {
      const start = { x: 100, y: 100 }
      const end = { x: 115, y: 180 }

      const direction = detectSwipeDirection(start, end, MIN_SWIPE_DISTANCE)
      expect(direction).toBe('down')
    })

    it('should handle negative coordinates', () => {
      const start = { x: -50, y: -50 }
      const end = { x: -100, y: -50 }

      const direction = detectSwipeDirection(start, end, MIN_SWIPE_DISTANCE)
      expect(direction).toBe('left')
    })
  })

  describe('getTouchCoordinates', () => {
    it('should extract coordinates from touch event', () => {
      const mockTouch = {
        clientX: 150,
        clientY: 200,
      } as Touch

      const coords = getTouchCoordinates(mockTouch)
      expect(coords.x).toBe(150)
      expect(coords.y).toBe(200)
    })

    it('should handle touch with zero coordinates', () => {
      const mockTouch = {
        clientX: 0,
        clientY: 0,
      } as Touch

      const coords = getTouchCoordinates(mockTouch)
      expect(coords.x).toBe(0)
      expect(coords.y).toBe(0)
    })
  })
})
