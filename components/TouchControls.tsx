/**
 * タッチコントロールコンポーネント
 */

'use client'

import { useEffect, useRef } from 'react'
import type { Direction } from '@/lib/types/game'
import { createSwipeHandler } from '@/lib/game/touch'

interface TouchControlsProps {
  onDirectionChange: (direction: Direction) => void
  minDistance?: number
}

export default function TouchControls({
  onDirectionChange,
  minDistance = 30,
}: TouchControlsProps) {
  const touchAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const touchArea = touchAreaRef.current
    if (!touchArea) return

    const { handleTouchStart, handleTouchEnd, handleTouchCancel } =
      createSwipeHandler({
        onSwipe: onDirectionChange,
        minDistance,
      })

    touchArea.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    })
    touchArea.addEventListener('touchend', handleTouchEnd, { passive: false })
    touchArea.addEventListener('touchcancel', handleTouchCancel, {
      passive: false,
    })

    return () => {
      touchArea.removeEventListener('touchstart', handleTouchStart)
      touchArea.removeEventListener('touchend', handleTouchEnd)
      touchArea.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [onDirectionChange, minDistance])

  return (
    <div
      ref={touchAreaRef}
      data-testid="touch-control-area"
      role="button"
      aria-label="スワイプして蛇を操作"
      className="md:hidden w-full h-32 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center mt-4"
      style={{ touchAction: 'none' }}
    >
      <div className="text-center text-gray-400">
        <div className="text-lg mb-1">👆 スワイプで操作</div>
        <div className="text-sm">↑ ↓ ← →</div>
      </div>
    </div>
  )
}
