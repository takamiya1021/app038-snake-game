/**
 * スコア計算ロジック
 */

import type { GameState, Food, Position } from '@/lib/types/game'

/**
 * スコアを加算
 * @param gameState ゲーム状態
 * @param points 加算するポイント
 * @returns 更新後のゲーム状態
 */
export function addScore(gameState: GameState, points: number): GameState {
  return {
    ...gameState,
    score: gameState.score + points,
    snake: {
      ...gameState.snake,
      score: gameState.snake.score + points,
    },
  }
}

/**
 * 餌との衝突を判定し、スコアと蛇を更新
 * @param gameState ゲーム状態
 * @returns 更新後のゲーム状態
 */
export function checkFoodCollision(gameState: GameState): GameState {
  const head = gameState.snake.body[0]

  // 餌と衝突しているかチェック
  const eatenFoodIndex = gameState.foods.findIndex(
    (food) => food.position.x === head.x && food.position.y === head.y
  )

  if (eatenFoodIndex === -1) {
    // 衝突なし
    return gameState
  }

  // 食べた餌を取得
  const eatenFood = gameState.foods[eatenFoodIndex]

  // 餌を削除
  const newFoods = gameState.foods.filter((_, index) => index !== eatenFoodIndex)

  // スコアを加算
  let newState = {
    ...gameState,
    foods: newFoods,
  }
  newState = addScore(newState, eatenFood.points)

  // 蛇を成長させる
  const newSnake = {
    ...newState.snake,
    body: [
      ...newState.snake.body,
      // 尻尾の最後のセグメントを複製（成長）
      newState.snake.body[newState.snake.body.length - 1],
    ],
  }

  return {
    ...newState,
    snake: newSnake,
  }
}
