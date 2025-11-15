/**
 * TouchControlsコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react'
import TouchControls from '../TouchControls'
import type { Direction } from '@/lib/types/game'

describe('TouchControls', () => {
  const mockOnDirectionChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render touch control area', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')
      expect(touchArea).toBeInTheDocument()
    })

    it('should render swipe instruction text', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      expect(screen.getByText(/スワイプで操作/i)).toBeInTheDocument()
    })

    it('should have appropriate touch-action CSS', () => {
      const { container } = render(
        <TouchControls onDirectionChange={mockOnDirectionChange} />
      )

      const touchArea = screen.getByTestId('touch-control-area')
      expect(touchArea.style.touchAction).toBe('none')
    })
  })

  describe('Swipe Detection', () => {
    it('should detect swipe up and call callback', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')

      // Simulate swipe up
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 200 }],
      })
      fireEvent.touchEnd(touchArea, {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      })

      expect(mockOnDirectionChange).toHaveBeenCalledWith('up')
    })

    it('should detect swipe down and call callback', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')

      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchEnd(touchArea, {
        changedTouches: [{ clientX: 100, clientY: 200 }],
      })

      expect(mockOnDirectionChange).toHaveBeenCalledWith('down')
    })

    it('should detect swipe left and call callback', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')

      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 200, clientY: 100 }],
      })
      fireEvent.touchEnd(touchArea, {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      })

      expect(mockOnDirectionChange).toHaveBeenCalledWith('left')
    })

    it('should detect swipe right and call callback', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')

      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchEnd(touchArea, {
        changedTouches: [{ clientX: 200, clientY: 100 }],
      })

      expect(mockOnDirectionChange).toHaveBeenCalledWith('right')
    })

    it('should not call callback for short swipes', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')

      // Short swipe (less than minimum distance)
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchEnd(touchArea, {
        changedTouches: [{ clientX: 110, clientY: 105 }],
      })

      expect(mockOnDirectionChange).not.toHaveBeenCalled()
    })

    it('should handle touch cancel', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')

      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchCancel(touchArea)

      // Should not crash and callback should not be called
      expect(mockOnDirectionChange).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')
      expect(touchArea).toHaveAttribute('role', 'button')
      expect(touchArea).toHaveAttribute('aria-label')
    })
  })

  describe('Responsive Behavior', () => {
    it('should render on mobile viewports', () => {
      // Note: In real scenario, this would test media queries
      // For now, we just verify the component renders
      render(<TouchControls onDirectionChange={mockOnDirectionChange} />)

      const touchArea = screen.getByTestId('touch-control-area')
      expect(touchArea).toBeInTheDocument()
    })
  })
})
