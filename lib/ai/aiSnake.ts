/**
 * AIスネークの行動ロジック
 */

import type { Position, Food, GameState, Direction } from '@/lib/types/game'
import { findPath, manhattanDistance } from './pathfinding'
import { getNextPosition, isOppositeDirection } from '@/lib/game/movement'

/**
 * 最も近い餌を見つける
 * @param head AIスネークの頭の位置
 * @param foods 餌の配列
 * @returns 最も近い餌（見つからない場合はnull）
 */
export function findNearestFood(head: Position, foods: Food[]): Food | null {
  if (foods.length === 0) {
    return null
  }

  let nearestFood = foods[0]
  let minDistance = manhattanDistance(head, nearestFood.position)

  for (let i = 1; i < foods.length; i++) {
    const distance = manhattanDistance(head, foods[i].position)
    if (distance < minDistance) {
      minDistance = distance
      nearestFood = foods[i]
    }
  }

  return nearestFood
}

/**
 * 障害物の位置を取得
 * @param gameState ゲーム状態
 * @returns 障害物の位置配列（プレイヤーの蛇とAIの蛇の体）
 */
export function getObstacles(gameState: GameState): Position[] {
  const obstacles: Position[] = []

  // プレイヤーの蛇の体全体を障害物に追加
  obstacles.push(...gameState.snake.body)

  // AIの蛇の体（頭以外）を障害物に追加
  if (gameState.aiSnake) {
    // AIの蛇の頭は除外（自分の頭は通過可能）
    obstacles.push(...gameState.aiSnake.body.slice(1))
  }

  return obstacles
}

/**
 * 経路から次の方向を決定
 * @param currentPos 現在の位置
 * @param path A*で計算された経路
 * @param currentDirection 現在の方向
 * @returns 次に進むべき方向
 */
export function getNextDirection(
  currentPos: Position,
  path: Position[],
  currentDirection: Direction
): Direction {
  // 経路が空、または現在位置のみの場合は現在の方向を維持
  if (path.length <= 1) {
    return currentDirection
  }

  // 次の位置を取得（path[0]は現在位置、path[1]が次の位置）
  const nextPos = path[1]

  // 方向を計算
  const dx = nextPos.x - currentPos.x
  const dy = nextPos.y - currentPos.y

  if (dx > 0) return 'right'
  if (dx < 0) return 'left'
  if (dy > 0) return 'down'
  if (dy < 0) return 'up'

  // 差分がない場合は現在の方向を維持
  return currentDirection
}

/**
 * AIの次の移動を計算
 * @param gameState ゲーム状態
 * @returns 次に進むべき方向
 */
export function calculateAIMove(gameState: GameState): Direction {
  const aiSnake = gameState.aiSnake

  // AIスネークが存在しない場合はデフォルトで上
  if (!aiSnake) {
    return 'up'
  }

  const head = aiSnake.body[0]
  const currentDirection = aiSnake.direction

  // 餌が存在しない場合は現在の方向を維持
  if (gameState.foods.length === 0) {
    return currentDirection
  }

  // 最も近い餌を見つける
  const nearestFood = findNearestFood(head, gameState.foods)
  if (!nearestFood) {
    return currentDirection
  }

  // 障害物を取得
  const obstacles = getObstacles(gameState)

  // A*で経路を探索
  const path = findPath(
    head,
    nearestFood.position,
    obstacles,
    gameState.grid.width,
    gameState.grid.height
  )

  // 経路が見つからない場合
  if (path.length === 0) {
    // フォールバック: 安全な方向を探す
    return findSafeDirection(head, obstacles, gameState.grid, currentDirection)
  }

  // 経路から次の方向を決定
  const nextDirection = getNextDirection(head, path, currentDirection)

  // 180度ターン（逆方向）を防ぐ
  if (isOppositeDirection(nextDirection, currentDirection)) {
    return currentDirection
  }

  return nextDirection
}

/**
 * 安全な方向を探す（経路が見つからない場合のフォールバック）
 * @param head 頭の位置
 * @param obstacles 障害物
 * @param grid グリッド
 * @param currentDirection 現在の方向
 * @returns 安全な方向
 */
function findSafeDirection(
  head: Position,
  obstacles: Position[],
  grid: { width: number; height: number },
  currentDirection: Direction
): Direction {
  const directions: Direction[] = ['up', 'down', 'left', 'right']
  const obstacleSet = new Set(obstacles.map((pos) => `${pos.x},${pos.y}`))

  // 各方向をチェック
  for (const dir of directions) {
    // 逆方向はスキップ
    if (isOppositeDirection(dir, currentDirection)) {
      continue
    }

    const nextPos = getNextPosition(head, dir)

    // グリッド外かチェック
    if (
      nextPos.x < 0 ||
      nextPos.x >= grid.width ||
      nextPos.y < 0 ||
      nextPos.y >= grid.height
    ) {
      continue
    }

    // 障害物がないかチェック
    const posKey = `${nextPos.x},${nextPos.y}`
    if (!obstacleSet.has(posKey)) {
      return dir
    }
  }

  // 安全な方向が見つからない場合は現在の方向を維持
  return currentDirection
}
