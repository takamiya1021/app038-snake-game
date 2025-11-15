/**
 * 衝突判定ロジック
 */

import type { Snake, GameState, Position, Grid } from '@/lib/types/game'

/**
 * 位置が境界外かどうかを判定
 * @param position 位置
 * @param grid グリッド
 * @returns 境界外の場合true
 */
export function isOutOfBounds(position: Position, grid: Grid): boolean {
  return (
    position.x < 0 ||
    position.x >= grid.width ||
    position.y < 0 ||
    position.y >= grid.height
  )
}

/**
 * 蛇が自分の体に衝突しているかを判定
 * @param snake 蛇
 * @returns 自分の体に衝突している場合true
 */
export function isSelfCollision(snake: Snake): boolean {
  const head = snake.body[0]
  // 頭以外の体の部分と比較
  return snake.body.slice(1).some(
    (segment) => segment.x === head.x && segment.y === head.y
  )
}

/**
 * エンドレスモード用: 位置をラップ（反対側に出現）
 * @param position 位置
 * @param grid グリッド
 * @returns ラップ後の位置
 */
export function wrapPosition(position: Position, grid: Grid): Position {
  let { x, y } = position

  // X座標のラップ
  if (x < 0) {
    x = grid.width - 1
  } else if (x >= grid.width) {
    x = 0
  }

  // Y座標のラップ
  if (y < 0) {
    y = grid.height - 1
  } else if (y >= grid.height) {
    y = 0
  }

  return { x, y }
}

/**
 * 蛇を縮める（エンドレスモードの自己衝突ペナルティ）
 * @param snake 蛇
 * @param amount 縮める量
 * @returns 縮めた後の蛇
 */
export function shrinkSnake(snake: Snake, amount: number): Snake {
  const newLength = Math.max(3, snake.body.length - amount) // 最小長さ3
  return {
    ...snake,
    body: snake.body.slice(0, newLength),
  }
}

/**
 * 衝突判定を実行し、ゲーム状態を更新
 * @param gameState ゲーム状態
 * @returns 更新後のゲーム状態
 */
export function checkCollisions(gameState: GameState): GameState {
  const { snake, grid, mode } = gameState
  const head = snake.body[0]

  // 1. 壁との衝突判定
  if (isOutOfBounds(head, grid)) {
    if (mode === 'endless') {
      // エンドレスモード: ワープ
      const wrappedHead = wrapPosition(head, grid)
      return {
        ...gameState,
        snake: {
          ...snake,
          body: [wrappedHead, ...snake.body.slice(1)],
        },
      }
    } else {
      // クラシック/タイムアタックモード: ゲームオーバー
      return {
        ...gameState,
        status: 'gameOver',
        snake: {
          ...snake,
          alive: false,
        },
      }
    }
  }

  // 2. 自分の体との衝突判定
  if (isSelfCollision(snake)) {
    if (mode === 'endless') {
      // エンドレスモード: 体を3マス短くする
      return {
        ...gameState,
        snake: shrinkSnake(snake, 3),
      }
    } else {
      // クラシック/タイムアタックモード: ゲームオーバー
      return {
        ...gameState,
        status: 'gameOver',
        snake: {
          ...snake,
          alive: false,
        },
      }
    }
  }

  // 衝突なし
  return gameState
}
