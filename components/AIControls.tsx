/**
 * AI対戦コントロールコンポーネント
 */

'use client'

import type { Snake, GameStatus } from '@/lib/types/game'

interface AIControlsProps {
  onStartBattle: () => void
  playerSnake: Snake
  aiSnake: Snake | null
  gameStatus: GameStatus
  winner?: 'player' | 'ai' | 'draw' | null
}

export default function AIControls({
  onStartBattle,
  playerSnake,
  aiSnake,
  gameStatus,
  winner,
}: AIControlsProps) {
  const isPlaying = gameStatus === 'playing'
  const isBattleActive = aiSnake !== null

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
      {/* AI FIGHT ボタン */}
      {!isBattleActive && (
        <button
          onClick={onStartBattle}
          disabled={!isPlaying && gameStatus !== 'gameOver' && gameStatus !== 'ready'}
          className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
            isPlaying || gameStatus === 'gameOver' || gameStatus === 'ready'
              ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer hover:scale-105'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          🤖 AI FIGHT
        </button>
      )}

      {/* スコア比較 */}
      <div className="flex flex-col gap-2">
        {/* プレイヤースコア */}
        <div
          className={`flex justify-between items-center p-2 rounded ${
            aiSnake && playerSnake.score > aiSnake.score
              ? 'bg-green-900/50 font-bold text-green-400'
              : 'bg-gray-700/50 text-gray-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: playerSnake.color }}
            />
            Player
          </span>
          <span className="text-xl">{playerSnake.score}</span>
        </div>

        {/* AIスコア */}
        {aiSnake && (
          <div
            className={`flex justify-between items-center p-2 rounded ${
              aiSnake.score > playerSnake.score
                ? 'bg-red-900/50 font-bold text-red-400'
                : 'bg-gray-700/50 text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: aiSnake.color }}
              />
              AI
            </span>
            <span className="text-xl">{aiSnake.score}</span>
          </div>
        )}
      </div>

      {/* 勝者表示 */}
      {winner && gameStatus === 'gameOver' && (
        <div
          className={`p-4 rounded-lg text-center font-bold text-2xl ${
            winner === 'player'
              ? 'bg-green-600 text-white'
              : winner === 'ai'
              ? 'bg-red-600 text-white'
              : 'bg-yellow-600 text-white'
          }`}
        >
          {winner === 'player' && '🏆 Player Wins!'}
          {winner === 'ai' && '🤖 AI Wins!'}
          {winner === 'draw' && '🤝 Draw!'}
        </div>
      )}
    </div>
  )
}
