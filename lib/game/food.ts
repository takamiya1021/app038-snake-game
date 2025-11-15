/**
 * 餌生成ロジック
 */

import type { Food, Position } from '@/lib/types/game'
import { NORMAL_FOOD_POINTS, SPECIAL_FOOD_POINTS } from '@/lib/utils/constants'

/**
 * ランダムな位置を生成
 * @param gridWidth グリッド幅
 * @param gridHeight グリッド高さ
 * @returns ランダムな位置
 */
export function generateRandomPosition(gridWidth: number, gridHeight: number): Position {
  return {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight),
  }
}

/**
 * 餌の位置が有効かどうかを判定
 * @param position 位置
 * @param occupiedPositions 占有されている位置のリスト
 * @returns 有効な場合true
 */
export function isFoodPositionValid(
  position: Position,
  occupiedPositions: Position[]
): boolean {
  return !occupiedPositions.some(
    (occupied) => occupied.x === position.x && occupied.y === position.y
  )
}

/**
 * 餌を生成
 * @param gridWidth グリッド幅
 * @param gridHeight グリッド高さ
 * @param occupiedPositions 占有されている位置のリスト
 * @param type 餌の種類
 * @returns 生成された餌
 */
export function generateFood(
  gridWidth: number,
  gridHeight: number,
  occupiedPositions: Position[],
  type: Food['type'] = 'normal'
): Food {
  // 有効な位置が見つかるまでループ
  let position: Position
  let attempts = 0
  const maxAttempts = 1000 // 無限ループ防止

  do {
    position = generateRandomPosition(gridWidth, gridHeight)
    attempts++
  } while (!isFoodPositionValid(position, occupiedPositions) && attempts < maxAttempts)

  // 餌のプロパティを設定
  const food: Food = {
    id: `food-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    position,
    type,
    points: type === 'normal' ? NORMAL_FOOD_POINTS : SPECIAL_FOOD_POINTS,
  }

  // 特殊餌の効果を設定
  if (type !== 'normal') {
    switch (type) {
      case 'speedBoost':
        food.effect = {
          type: 'speed',
          duration: 10, // 10秒間
          multiplier: 1.5,
        }
        food.expiresAt = Date.now() + 30000 // 30秒後に消滅
        break
      case 'scoreDouble':
        food.effect = {
          type: 'score',
          duration: 10, // 10秒間
          multiplier: 2,
        }
        food.expiresAt = Date.now() + 30000
        break
      case 'shrink':
        food.effect = {
          type: 'shrink',
          duration: 0, // 即時効果
        }
        food.expiresAt = Date.now() + 30000
        break
    }
  }

  return food
}

/**
 * 餌のリストから期限切れの餌を削除
 * @param foods 餌のリスト
 * @returns 期限切れでない餌のリスト
 */
export function removeExpiredFoods(foods: Food[]): Food[] {
  const now = Date.now()
  return foods.filter((food) => !food.expiresAt || food.expiresAt > now)
}
