/**
 * プレイ分析ロジック
 */

import type { GameState, Snake, GameMode, Difficulty } from '@/lib/types/game'
import { isOutOfBounds } from './collision'

/**
 * プレイデータの型定義
 */
export interface PlayData {
  survivalTime: number // 生存時間（ミリ秒）
  finalScore: number // 最終スコア
  finalLevel: number // 到達レベル
  foodsEaten: number // 食べた餌の数
  deathCause: 'wall' | 'self' | 'ai' | null // 死因
  scoreEfficiency: number // スコア効率（スコア/秒）
  avgScorePerFood: number // 餌あたりの平均スコア
  mode: GameMode // ゲームモード
  difficulty: Difficulty // 難易度
}

/**
 * 死因を判定
 * @param gameState ゲーム状態
 * @param snake 対象の蛇
 * @returns 死因
 */
export function determineDeathCause(
  gameState: GameState,
  snake: Snake
): 'wall' | 'self' | 'ai' | null {
  // 蛇が生きている場合
  if (snake.alive) {
    return null
  }

  const head = snake.body[0]

  // 壁衝突判定
  if (isOutOfBounds(head, gameState.grid)) {
    return 'wall'
  }

  // 自己衝突判定
  const bodyWithoutHead = snake.body.slice(1)
  const isSelfCollision = bodyWithoutHead.some(
    (segment) => segment.x === head.x && segment.y === head.y
  )

  if (isSelfCollision) {
    return 'self'
  }

  // AI対戦モードで、AIが生きている場合
  if (gameState.mode === 'aiBattle' && gameState.aiSnake?.alive) {
    return 'ai'
  }

  // その他の原因（デフォルトは自己衝突扱い）
  return 'self'
}

/**
 * スコア効率を計算（スコア/秒）
 * @param score スコア
 * @param survivalTime 生存時間（ミリ秒）
 * @returns スコア効率
 */
export function calculateScoreEfficiency(
  score: number,
  survivalTime: number
): number {
  if (survivalTime === 0) {
    return 0
  }

  // ミリ秒を秒に変換
  const survivalTimeInSeconds = survivalTime / 1000
  return score / survivalTimeInSeconds
}

/**
 * 餌あたりの平均スコアを計算
 * @param score スコア
 * @param foodsEaten 食べた餌の数
 * @returns 餌あたりの平均スコア
 */
export function calculateAvgScorePerFood(
  score: number,
  foodsEaten: number
): number {
  if (foodsEaten === 0) {
    return 0
  }

  return score / foodsEaten
}

/**
 * プレイデータを収集
 * @param gameState ゲーム状態
 * @param startTime ゲーム開始時刻（ミリ秒）
 * @param foodsEaten 食べた餌の数
 * @returns プレイデータ
 */
export function collectPlayData(
  gameState: GameState,
  startTime: number,
  foodsEaten: number
): PlayData {
  const endTime = Date.now()
  const survivalTime = endTime - startTime

  const scoreEfficiency = calculateScoreEfficiency(
    gameState.score,
    survivalTime
  )

  const avgScorePerFood = calculateAvgScorePerFood(
    gameState.score,
    foodsEaten
  )

  const deathCause = determineDeathCause(gameState, gameState.snake)

  return {
    survivalTime,
    finalScore: gameState.score,
    finalLevel: gameState.level,
    foodsEaten,
    deathCause,
    scoreEfficiency,
    avgScorePerFood,
    mode: gameState.mode,
    difficulty: gameState.difficulty,
  }
}
