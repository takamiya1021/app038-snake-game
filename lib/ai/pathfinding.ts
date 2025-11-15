/**
 * A*経路探索アルゴリズム
 */

import type { Position } from '@/lib/types/game'

/**
 * A*用のノード
 */
interface Node {
  position: Position
  g: number // 開始からのコスト
  h: number // ヒューリスティック（ゴールまでの推定コスト）
  f: number // g + h
  parent: Node | null
}

/**
 * 簡易的な優先度キュー
 */
class PriorityQueue {
  private items: { node: Node; priority: number }[] = []

  enqueue(node: Node, priority: number): void {
    this.items.push({ node, priority })
    this.items.sort((a, b) => a.priority - b.priority)
  }

  dequeue(): Node | undefined {
    return this.items.shift()?.node
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }
}

/**
 * マンハッタン距離を計算
 * @param a 位置A
 * @param b 位置B
 * @returns マンハッタン距離
 */
export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

/**
 * 位置を文字列に変換（ハッシュ用）
 */
function positionToString(pos: Position): string {
  return `${pos.x},${pos.y}`
}

/**
 * 隣接する位置を取得（上下左右）
 * @param position 現在の位置
 * @param gridWidth グリッド幅
 * @param gridHeight グリッド高さ
 * @returns 隣接する位置の配列
 */
export function getNeighbors(
  position: Position,
  gridWidth: number,
  gridHeight: number
): Position[] {
  const neighbors: Position[] = []
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 }, // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 }, // right
  ]

  for (const dir of directions) {
    const newPos = {
      x: position.x + dir.x,
      y: position.y + dir.y,
    }

    // グリッド内かチェック
    if (
      newPos.x >= 0 &&
      newPos.x < gridWidth &&
      newPos.y >= 0 &&
      newPos.y < gridHeight
    ) {
      neighbors.push(newPos)
    }
  }

  return neighbors
}

/**
 * 経路を再構築
 * @param node ゴールノード
 * @returns 開始からゴールまでの経路
 */
export function reconstructPath(node: Node): Position[] {
  const path: Position[] = []
  let current: Node | null = node

  while (current !== null) {
    path.unshift(current.position)
    current = current.parent
  }

  return path
}

/**
 * A*アルゴリズムで最短経路を探索
 * @param start 開始位置
 * @param goal ゴール位置
 * @param obstacles 障害物の位置配列
 * @param gridWidth グリッド幅
 * @param gridHeight グリッド高さ
 * @returns 経路（見つからない場合は空配列）
 */
export function findPath(
  start: Position,
  goal: Position,
  obstacles: Position[],
  gridWidth: number,
  gridHeight: number
): Position[] {
  // 開始 = ゴールの場合
  if (start.x === goal.x && start.y === goal.y) {
    return [start]
  }

  // 障害物をSetに変換（高速検索）
  const obstacleSet = new Set(obstacles.map(positionToString))

  const openSet = new PriorityQueue()
  const closedSet = new Set<string>()

  const startNode: Node = {
    position: start,
    g: 0,
    h: manhattanDistance(start, goal),
    f: manhattanDistance(start, goal),
    parent: null,
  }

  openSet.enqueue(startNode, startNode.f)

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue()
    if (!current) break

    const currentKey = positionToString(current.position)

    // 既に訪問済みならスキップ（重複処理を防ぐ）
    if (closedSet.has(currentKey)) {
      continue
    }

    // ゴールに到達
    if (current.position.x === goal.x && current.position.y === goal.y) {
      return reconstructPath(current)
    }

    closedSet.add(currentKey)

    // 隣接セルを展開
    const neighbors = getNeighbors(current.position, gridWidth, gridHeight)

    for (const neighborPos of neighbors) {
      const neighborKey = positionToString(neighborPos)

      // 障害物または既に評価済みの場合はスキップ
      if (obstacleSet.has(neighborKey) || closedSet.has(neighborKey)) {
        continue
      }

      const g = current.g + 1
      const h = manhattanDistance(neighborPos, goal)
      const f = g + h

      const neighborNode: Node = {
        position: neighborPos,
        g,
        h,
        f,
        parent: current,
      }

      openSet.enqueue(neighborNode, f)
    }
  }

  // 経路が見つからない
  return []
}
