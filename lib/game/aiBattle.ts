/**
 * AI対戦モードのロジック
 */

import type { GameState, Snake, Position } from '@/lib/types/game'
import { calculateAIMove } from '@/lib/ai/aiSnake'
import { moveSnake, changeDirection } from './movement'
import { GRID_WIDTH, GRID_HEIGHT } from '@/lib/utils/constants'

/**
 * AIスネークを初期化
 * @param gameState 現在のゲーム状態
 * @returns AIスネークを含むゲーム状態
 */
export function initializeAISnake(gameState: GameState): GameState {
  // 既にAIスネークが存在する場合は何もしない
  if (gameState.aiSnake) {
    return gameState
  }

  // プレイヤーから離れた位置を探す
  const playerHead = gameState.snake.body[0]
  let aiStartPos: Position

  // グリッドの反対側に配置
  const oppositeX = playerHead.x < GRID_WIDTH / 2 ? GRID_WIDTH - 4 : 3
  const oppositeY = playerHead.y < GRID_HEIGHT / 2 ? GRID_HEIGHT - 4 : 3

  aiStartPos = { x: oppositeX, y: oppositeY }

  // AIスネークを作成
  const aiSnake: Snake = {
    id: 'ai',
    body: [
      aiStartPos,
      { x: aiStartPos.x, y: aiStartPos.y + 1 },
      { x: aiStartPos.x, y: aiStartPos.y + 2 },
    ],
    direction: 'up',
    nextDirection: 'up',
    color: '#ef4444',
    score: 0,
    alive: true,
  }

  return {
    ...gameState,
    aiSnake,
  }
}

/**
 * AIスネークを更新（移動）
 * @param gameState 現在のゲーム状態
 * @returns 更新されたゲーム状態
 */
export function updateAISnake(gameState: GameState): GameState {
  const aiSnake = gameState.aiSnake

  // AIスネークが存在しない、または死んでいる、またはゲームが終了している場合は何もしない
  if (!aiSnake || !aiSnake.alive || gameState.status !== 'playing') {
    return gameState
  }

  // AIの次の移動方向を計算
  const nextDirection = calculateAIMove(gameState)

  // AIスネークの方向を更新
  let updatedAISnake = changeDirection(aiSnake, nextDirection)

  // AIスネークを移動（餌を食べていない場合）
  updatedAISnake = moveSnake(updatedAISnake, false)

  return {
    ...gameState,
    aiSnake: updatedAISnake,
  }
}

/**
 * AIスネークの餌との衝突を処理
 * @param gameState 現在のゲーム状態
 * @returns 更新されたゲーム状態
 */
export function processAIFoodCollision(gameState: GameState): GameState {
  const aiSnake = gameState.aiSnake

  // AIスネークが存在しない場合は何もしない
  if (!aiSnake) {
    return gameState
  }

  const aiHead = aiSnake.body[0]

  // 餌との衝突をチェック
  const eatenFoodIndex = gameState.foods.findIndex(
    (food) => food.position.x === aiHead.x && food.position.y === aiHead.y
  )

  // 餌を食べていない場合は何もしない
  if (eatenFoodIndex === -1) {
    return gameState
  }

  const eatenFood = gameState.foods[eatenFoodIndex]

  // 餌を削除
  const newFoods = gameState.foods.filter((_, index) => index !== eatenFoodIndex)

  // AIスネークのスコアを更新
  const updatedAISnake: Snake = {
    ...aiSnake,
    score: aiSnake.score + eatenFood.points,
    // 体を成長させる
    body: [...aiSnake.body, aiSnake.body[aiSnake.body.length - 1]],
  }

  return {
    ...gameState,
    aiSnake: updatedAISnake,
    foods: newFoods,
  }
}

/**
 * 対戦の勝者を判定
 * @param gameState 現在のゲーム状態
 * @returns 'player' | 'ai' | 'draw' | null
 */
export function checkBattleWinner(
  gameState: GameState
): 'player' | 'ai' | 'draw' | null {
  const { snake: player, aiSnake } = gameState

  // AIスネークが存在しない場合
  if (!aiSnake) {
    return null
  }

  const playerAlive = player.alive
  const aiAlive = aiSnake.alive

  // 両方生きている場合
  if (playerAlive && aiAlive) {
    return null
  }

  // プレイヤーのみ生存
  if (playerAlive && !aiAlive) {
    return 'player'
  }

  // AIのみ生存
  if (!playerAlive && aiAlive) {
    return 'ai'
  }

  // 両方死亡の場合、スコアで判定
  if (!playerAlive && !aiAlive) {
    if (player.score > aiSnake.score) {
      return 'player'
    } else if (player.score < aiSnake.score) {
      return 'ai'
    } else {
      return 'draw'
    }
  }

  return null
}
