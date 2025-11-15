/**
 * タッチ・スワイプ検出ロジック
 */

import type { Direction } from '@/lib/types/game'

/**
 * 座標の型定義
 */
export interface Coordinates {
  x: number
  y: number
}

/**
 * タッチイベントから座標を取得
 * @param touch タッチオブジェクト
 * @returns 座標
 */
export function getTouchCoordinates(touch: Touch): Coordinates {
  return {
    x: touch.clientX,
    y: touch.clientY,
  }
}

/**
 * スワイプの距離を計算
 * @param start 開始座標
 * @param end 終了座標
 * @returns x, y方向の距離
 */
export function calculateSwipeDistance(
  start: Coordinates,
  end: Coordinates
): Coordinates {
  return {
    x: end.x - start.x,
    y: end.y - start.y,
  }
}

/**
 * スワイプ方向を判定
 * @param start 開始座標
 * @param end 終了座標
 * @param minDistance 最小スワイプ距離（ピクセル）
 * @returns スワイプ方向（検出できない場合はnull）
 */
export function detectSwipeDirection(
  start: Coordinates,
  end: Coordinates,
  minDistance: number = 30
): Direction | null {
  const distance = calculateSwipeDistance(start, end)
  const absX = Math.abs(distance.x)
  const absY = Math.abs(distance.y)

  // 最小距離に達していない場合は無効
  const totalDistance = Math.sqrt(absX * absX + absY * absY)
  if (totalDistance < minDistance) {
    return null
  }

  // 主要な方向を判定（より大きい方向を優先）
  if (absX > absY) {
    // 横方向のスワイプ
    return distance.x > 0 ? 'right' : 'left'
  } else {
    // 縦方向のスワイプ
    return distance.y > 0 ? 'down' : 'up'
  }
}

/**
 * スワイプイベントハンドラーの型定義
 */
export interface SwipeHandlers {
  onSwipe: (direction: Direction) => void
  minDistance?: number
}

/**
 * スワイプハンドラーを作成
 * @param handlers スワイプハンドラー設定
 * @returns タッチイベントハンドラー
 */
export function createSwipeHandler(handlers: SwipeHandlers) {
  let touchStart: Coordinates | null = null

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      touchStart = getTouchCoordinates(touch)
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    if (!touch) return

    const touchEnd = getTouchCoordinates(touch)
    const direction = detectSwipeDirection(
      touchStart,
      touchEnd,
      handlers.minDistance
    )

    if (direction) {
      handlers.onSwipe(direction)
    }

    touchStart = null
  }

  const handleTouchCancel = () => {
    touchStart = null
  }

  return {
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  }
}
