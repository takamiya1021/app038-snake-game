/**
 * 蛇の移動ロジック
 */

import type { Snake, Direction, Position } from '@/lib/types/game'

/**
 * 蛇を移動させる
 * @param snake 蛇の状態
 * @param shouldGrow 成長するかどうか（餌を食べた場合）
 * @returns 移動後の蛇の状態
 */
export function moveSnake(snake: Snake, shouldGrow: boolean = false): Snake {
  // nextDirectionを現在の方向に適用
  const newDirection = snake.nextDirection

  // 新しい頭の位置を計算
  const head = snake.body[0]
  const newHead = getNextPosition(head, newDirection)

  // 新しい体を作成
  let newBody: Position[]
  if (shouldGrow) {
    // 成長する場合は尻尾を削除しない
    newBody = [newHead, ...snake.body]
  } else {
    // 通常の移動（尻尾を削除）
    newBody = [newHead, ...snake.body.slice(0, -1)]
  }

  return {
    ...snake,
    body: newBody,
    direction: newDirection,
  }
}

/**
 * 2つの方向が逆方向かどうかを判定
 * @param dir1 方向1
 * @param dir2 方向2
 * @returns 逆方向の場合true
 */
export function isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
  return (
    (dir1 === 'up' && dir2 === 'down') ||
    (dir1 === 'down' && dir2 === 'up') ||
    (dir1 === 'left' && dir2 === 'right') ||
    (dir1 === 'right' && dir2 === 'left')
  )
}

/**
 * 指定された方向への次の位置を計算
 * @param position 現在の位置
 * @param direction 方向
 * @returns 次の位置
 */
export function getNextPosition(position: Position, direction: Direction): Position {
  switch (direction) {
    case 'up':
      return { x: position.x, y: position.y - 1 }
    case 'down':
      return { x: position.x, y: position.y + 1 }
    case 'left':
      return { x: position.x - 1, y: position.y }
    case 'right':
      return { x: position.x + 1, y: position.y }
  }
}

/**
 * 方向を変更（逆方向への変更は無効）
 * @param snake 蛇の状態
 * @param newDirection 新しい方向
 * @returns 方向変更後の蛇の状態
 */
export function changeDirection(snake: Snake, newDirection: Direction): Snake {
  // 逆方向への変更は無効
  if (isOppositeDirection(snake.direction, newDirection)) {
    return snake
  }

  return {
    ...snake,
    nextDirection: newDirection,
  }
}
