'use client'

/**
 * GameFieldコンポーネント
 * ゲームフィールド全体を管理
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import Snake from './Snake'
import type { GameState, Direction } from '@/lib/types/game'
import { GameLoop } from '@/lib/game/gameLoop'
import { changeDirection, moveSnake } from '@/lib/game/movement'
import { checkCollisions } from '@/lib/game/collision'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  INITIAL_PLAYER_POSITION,
  PLAYER_SNAKE_COLOR,
  INITIAL_SNAKE_LENGTH,
} from '@/lib/utils/constants'

const CELL_SIZE = 20 // 各セルのサイズ（px）

export default function GameField() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    mode: 'classic',
    difficulty: 'easy',
    status: 'ready',
    score: 0,
    level: 1,
    speed: 1.0,
    timeLeft: 0,
    grid: {
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
    },
    snake: {
      id: 'player',
      body: Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
        x: INITIAL_PLAYER_POSITION.x - i,
        y: INITIAL_PLAYER_POSITION.y,
      })),
      direction: 'right',
      nextDirection: 'right',
      color: PLAYER_SNAKE_COLOR,
      score: 0,
      alive: true,
    },
    aiSnake: null,
    foods: [],
  }))

  const [gameLoop] = useState(() => new GameLoop(gameState))
  const gameStateRef = useRef(gameState)

  // ゲーム状態の参照を更新
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // ゲーム更新ロジック
  const updateGame = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.status !== 'playing') {
        return prevState
      }

      // 蛇を移動
      const movedSnake = moveSnake(prevState.snake)

      // 衝突判定
      const stateAfterMove = {
        ...prevState,
        snake: movedSnake,
      }
      const stateAfterCollision = checkCollisions(stateAfterMove)

      return stateAfterCollision
    })
  }, [])

  // ゲームループの更新コールバックを設定
  useEffect(() => {
    gameLoop.setUpdateCallback(updateGame)
  }, [gameLoop, updateGame])

  // ゲーム開始
  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: 'playing',
    }))
    gameLoop.start()
  }, [gameLoop])

  // ゲーム開始（初回のみ）
  useEffect(() => {
    if (gameState.status === 'ready') {
      startGame()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // キーボード入力ハンドラ
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }

      const direction = keyMap[e.key]
      if (direction) {
        e.preventDefault()
        setGameState((prev) => ({
          ...prev,
          snake: changeDirection(prev.snake, direction),
        }))
      }
    },
    []
  )

  // キーボードイベントリスナーの設定
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ゲーム状態の更新をGameLoopに反映
  useEffect(() => {
    gameLoop.setState(gameState)
  }, [gameState, gameLoop])

  // クリーンアップ
  useEffect(() => {
    return () => {
      gameLoop.stop()
    }
  }, [gameLoop])

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* ゲーム情報 */}
      <div className="flex gap-8 text-lg">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">スコア:</span>
          <span className="font-bold text-cyan-400">{gameState.score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">レベル:</span>
          <span className="font-bold text-green-400">Lv.{gameState.level}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">速度:</span>
          <span className="font-bold text-yellow-400">×{gameState.speed.toFixed(1)}</span>
        </div>
      </div>

      {/* ゲームグリッド */}
      <div
        data-testid="game-grid"
        className="relative border-2 border-cyan-500 rounded-lg"
        style={{
          width: `${GRID_WIDTH * CELL_SIZE}px`,
          height: `${GRID_HEIGHT * CELL_SIZE}px`,
          backgroundColor: '#1f2937',
          backgroundImage: `
            linear-gradient(to right, #374151 1px, transparent 1px),
            linear-gradient(to bottom, #374151 1px, transparent 1px)
          `,
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
        }}
      >
        {/* 蛇を描画 */}
        <Snake snake={gameState.snake} cellSize={CELL_SIZE} />
      </div>

      {/* ゲームオーバー表示 */}
      {gameState.status === 'gameOver' && (
        <div className="mt-4 text-center">
          <div
            className="text-3xl font-bold text-red-400 mb-4"
            style={{
              textShadow: '0 0 10px #f87171, 0 0 20px #f87171',
            }}
          >
            GAME OVER
          </div>
          <p className="text-gray-400">最終スコア: {gameState.score}</p>
        </div>
      )}

      {/* 操作説明 */}
      <div className="text-center text-sm text-gray-500">
        <p>矢印キー（↑↓←→）で操作</p>
        {gameState.status === 'playing' && <p className="mt-1 text-green-400">ゲーム進行中</p>}
      </div>
    </div>
  )
}
