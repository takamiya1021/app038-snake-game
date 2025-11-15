/**
 * レベルアップロジック
 */

import type { GameState } from '@/lib/types/game'
import {
  SCORE_PER_LEVEL,
  SPEED_INCREASE_PER_LEVEL,
  MAX_LEVEL,
  MAX_SPEED,
} from '@/lib/utils/constants'

/**
 * スコアに基づいてレベルを計算
 * @param score スコア
 * @returns レベル
 */
function calculateLevel(score: number): number {
  const level = Math.floor(score / SCORE_PER_LEVEL) + 1
  return Math.min(level, MAX_LEVEL)
}

/**
 * レベルに基づいて速度を計算
 * @param level レベル
 * @returns 速度倍率
 */
export function calculateSpeed(level: number): number {
  if (level <= 0) {
    return 1.0
  }
  const speed = 1.0 + (level - 1) * SPEED_INCREASE_PER_LEVEL
  return Math.min(speed, MAX_SPEED)
}

/**
 * レベルアップをチェックし、必要に応じてゲーム状態を更新
 * @param gameState ゲーム状態
 * @returns 更新後のゲーム状態
 */
export function checkLevelUp(gameState: GameState): GameState {
  const newLevel = calculateLevel(gameState.score)
  const leveledUp = newLevel > gameState.level

  if (!leveledUp) {
    return {
      ...gameState,
      leveledUp: false,
    }
  }

  const newSpeed = calculateSpeed(newLevel)

  return {
    ...gameState,
    level: newLevel,
    speed: newSpeed,
    leveledUp: true,
  }
}
