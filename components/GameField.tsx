'use client'

/**
 * GameFieldコンポーネント
 * ゲームフィールド全体を管理
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import Snake from './Snake'
import Food from './Food'
import LevelUpNotification from './LevelUpNotification'
import AIControls from './AIControls'
import TouchControls from './TouchControls'
import AIAnalysisPanel from './AIAnalysisPanel'
import CountdownOverlay from './CountdownOverlay'
import type { GameState, Direction } from '@/lib/types/game'
import { GameLoop } from '@/lib/game/gameLoop'
import { changeDirection, moveSnake } from '@/lib/game/movement'
import { checkCollisions } from '@/lib/game/collision'
import { generateFood } from '@/lib/game/food'
import { checkFoodCollision } from '@/lib/game/scoring'
import { checkLevelUp } from '@/lib/game/level'
import {
  initializeAISnake,
  updateAISnake,
  processAIFoodCollision,
  checkBattleWinner,
} from '@/lib/game/aiBattle'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  INITIAL_PLAYER_POSITION,
  PLAYER_SNAKE_COLOR,
  INITIAL_SNAKE_LENGTH,
} from '@/lib/utils/constants'
import { collectPlayData, type PlayData } from '@/lib/game/analytics'
import { saveGameHistory } from '@/lib/db/schema'

const CELL_SIZE = 20 // 各セルのサイズ（px）

interface GameFieldProps {
  enableAI?: boolean
}

export default function GameField({ enableAI = false }: GameFieldProps) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialSnake = {
      id: 'player' as const,
      body: Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
        x: INITIAL_PLAYER_POSITION.x - i,
        y: INITIAL_PLAYER_POSITION.y,
      })),
      direction: 'right' as const,
      nextDirection: 'right' as const,
      color: PLAYER_SNAKE_COLOR,
      score: 0,
      alive: true,
    }

    // 初期餌を生成
    const initialFood = generateFood(
      GRID_WIDTH,
      GRID_HEIGHT,
      initialSnake.body,
      'normal'
    )

    return {
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
      snake: initialSnake,
      aiSnake: null,
      foods: [initialFood],
      foodsEaten: 0,
    }
  })

  const [gameLoop] = useState(() => new GameLoop(gameState))
  const gameStateRef = useRef(gameState)
  const [winner, setWinner] = useState<'player' | 'ai' | 'draw' | null>(null)
  const [lastPlayData, setLastPlayData] = useState<PlayData | null>(null)
  const [eatingFoods, setEatingFoods] = useState<typeof gameState.foods>([])
  const [showCountdown, setShowCountdown] = useState(true)

  // ゲーム統計追跡
  const gameStartTimeRef = useRef<number>(Date.now())
  const historySavedRef = useRef<boolean>(false)

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

      // プレイヤーの蛇を移動
      const movedSnake = moveSnake(prevState.snake)
      let stateAfterMove = {
        ...prevState,
        snake: movedSnake,
      }

      // 餌を食べるかチェック（アニメーション用）
      const head = movedSnake.body[0]
      const eatenFoodIndex = prevState.foods.findIndex(
        (food) => food.position.x === head.x && food.position.y === head.y
      )

      if (eatenFoodIndex !== -1) {
        const eatenFood = prevState.foods[eatenFoodIndex]
        // 食べられた餌をeatingFoods配列に追加（重複チェック）
        setEatingFoods(prev => {
          // 既に存在する場合は追加しない
          if (prev.some(f => f.id === eatenFood.id)) {
            return prev
          }
          return [...prev, eatenFood]
        })
        // 400msアニメーション後に削除
        setTimeout(() => {
          setEatingFoods(prev => prev.filter(f => f.id !== eatenFood.id))
        }, 400)
      }

      // AIスネークを更新
      stateAfterMove = updateAISnake(stateAfterMove)

      // プレイヤーの餌との衝突判定
      const stateAfterPlayerFood = checkFoodCollision(stateAfterMove)
      const playerAteFood = stateAfterPlayerFood.score > prevState.score

      // AIの餌との衝突判定
      let stateAfterAIFood = processAIFoodCollision(stateAfterPlayerFood)

      // 餌を食べたら新しい餌を生成
      if (stateAfterAIFood.foods.length === 0) {
        const allSnakeBodies = [
          ...stateAfterAIFood.snake.body,
          ...(stateAfterAIFood.aiSnake?.body || []),
        ]
        const newFood = generateFood(
          stateAfterAIFood.grid.width,
          stateAfterAIFood.grid.height,
          allSnakeBodies,
          'normal'
        )
        stateAfterMove = {
          ...stateAfterAIFood,
          foods: [newFood],
        }
      } else {
        stateAfterMove = stateAfterAIFood
      }

      // レベルアップチェック
      const stateAfterLevelCheck = checkLevelUp(stateAfterMove)

      // プレイヤーの壁・自己衝突判定
      const stateAfterCollision = checkCollisions(stateAfterLevelCheck)

      // AIの衝突判定（AIが存在する場合）
      let finalState = stateAfterCollision
      if (finalState.aiSnake) {
        // AI用の衝突判定（プレイヤーとの衝突も含む）
        const aiCollisionState = {
          ...finalState,
          snake: finalState.aiSnake,
        }
        const aiAfterCollision = checkCollisions(aiCollisionState)

        finalState = {
          ...finalState,
          aiSnake: {
            ...aiAfterCollision.snake,
            id: 'ai' as const,
          },
        }
      }

      // 勝敗判定
      const battleWinner = checkBattleWinner(finalState)
      if (battleWinner && finalState.aiSnake) {
        setWinner(battleWinner)
        finalState = { ...finalState, status: 'gameOver' }
      }

      const foodsEaten = playerAteFood
        ? prevState.foodsEaten + 1
        : prevState.foodsEaten

      return {
        ...finalState,
        foodsEaten,
      }
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
      foodsEaten: 0,
    }))
    gameLoop.start()
  }, [gameLoop])

  // AI対戦開始
  const handleStartBattle = useCallback(() => {
    setGameState((prev) => {
      // ゲームオーバー時に押された場合は、ゲームをリセットしてAI対戦を開始
      if (prev.status === 'gameOver') {
        const initialSnake = {
          id: 'player' as const,
          body: Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
            x: INITIAL_PLAYER_POSITION.x - i,
            y: INITIAL_PLAYER_POSITION.y,
          })),
          direction: 'right' as const,
          nextDirection: 'right' as const,
          color: PLAYER_SNAKE_COLOR,
          score: 0,
          alive: true,
        }

        const initialFood = generateFood(
          GRID_WIDTH,
          GRID_HEIGHT,
          initialSnake.body,
          'normal'
        )

        const resetState: GameState = {
          mode: prev.mode,
          difficulty: prev.difficulty,
          status: 'ready', // readyに変更（カウントダウン後に開始）
          score: 0,
          level: 1,
          speed: 1.0, // 速度を初期化
          timeLeft: 0,
          grid: {
            width: GRID_WIDTH,
            height: GRID_HEIGHT,
          },
          snake: initialSnake,
          aiSnake: null,
          foods: [initialFood],
          foodsEaten: 0,
        }

        // カウントダウンを再表示
        setShowCountdown(true)

        // AIを追加して返す
        return initializeAISnake(resetState)
      }

      // プレイ中の場合はそのままAIを追加
      return initializeAISnake(prev)
    })
    setWinner(null)

    // ゲームループを再開（ゲームオーバーからの復帰時）
    if (gameState.status === 'gameOver') {
      gameLoop.start()
    }
  }, [gameLoop, gameState.status])

  // カウントダウン完了時のハンドラ
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false)
    if (gameState.status === 'ready') {
      // AI対戦モードが有効な場合、AIを初期化してからゲームを開始
      if (enableAI) {
        setGameState((prev) => initializeAISnake(prev))
      }
      startGame()
    }
  }, [gameState.status, startGame, enableAI])

  // ゲーム開始時に統計をリセット
  useEffect(() => {
    if (gameState.status === 'playing') {
      gameStartTimeRef.current = Date.now()
      setLastPlayData(null)
    }
  }, [gameState.status])

  // 方向変更ハンドラ（キーボード＆タッチ共通）
  const handleDirectionChange = useCallback((direction: Direction) => {
    setGameState((prev) => ({
      ...prev,
      snake: changeDirection(prev.snake, direction),
    }))
  }, [])

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
        handleDirectionChange(direction)
      }
    },
    [handleDirectionChange]
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

  // ゲーム履歴を保存
  useEffect(() => {
    if (gameState.status === 'playing') {
      historySavedRef.current = false
      return
    }

    if (gameState.status !== 'gameOver' || historySavedRef.current) {
      return
    }

    historySavedRef.current = true

    const finalState = gameStateRef.current
    const playData = collectPlayData(finalState, gameStartTimeRef.current)
    setLastPlayData(playData)

    // 非同期で保存（エラーは無視）
    saveGameHistory(playData).catch((error) => {
      console.error('Failed to save game history:', error)
    })
  }, [gameState.status])

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
        <div className="flex items-center gap-2">
          <span className="text-gray-400">餌:</span>
          <span className="font-bold text-pink-400">{gameState.foodsEaten}</span>
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
        {/* プレイヤーの蛇を描画 */}
        <Snake snake={gameState.snake} cellSize={CELL_SIZE} />

        {/* AIの蛇を描画 */}
        {gameState.aiSnake && (
          <Snake snake={gameState.aiSnake} cellSize={CELL_SIZE} />
        )}

        {/* 餌を描画 */}
        {gameState.foods.map((food) => (
          <Food
            key={food.id}
            food={food}
            cellSize={CELL_SIZE}
            isBeingEaten={false}
          />
        ))}

        {/* 食べられている途中の餌を描画（アニメーション用） */}
        {eatingFoods.map((food) => (
          <Food
            key={`eating-${food.id}`}
            food={food}
            cellSize={CELL_SIZE}
            isBeingEaten={true}
          />
        ))}
      </div>

      {/* AI対戦コントロール */}
      <AIControls
        onStartBattle={handleStartBattle}
        playerSnake={gameState.snake}
        aiSnake={gameState.aiSnake}
        gameStatus={gameState.status}
        winner={winner}
      />

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

      {/* AI分析パネル */}
      {gameState.status === 'gameOver' && (
        <AIAnalysisPanel playData={lastPlayData} />
      )}

      {/* 操作説明 */}
      <div className="text-center text-sm text-gray-500">
        <p className="hidden md:block">矢印キー（↑↓←→）で操作</p>
        {gameState.status === 'playing' && <p className="mt-1 text-green-400">ゲーム進行中</p>}
      </div>

      {/* タッチコントロール（モバイルのみ） */}
      <TouchControls onDirectionChange={handleDirectionChange} />

      {/* レベルアップ通知 */}
      <LevelUpNotification
        show={gameState.leveledUp || false}
        level={gameState.level}
        onComplete={() => {
          setGameState((prev) => ({ ...prev, leveledUp: false }))
        }}
      />

      {/* カウントダウンオーバーレイ */}
      {showCountdown && <CountdownOverlay onComplete={handleCountdownComplete} />}
    </div>
  )
}
