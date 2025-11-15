/**
 * ゲーム履歴表示コンポーネント
 */

'use client'

import { useEffect, useState } from 'react'
import {
  getGameHistory,
  getStatistics,
  type GameHistory as GameHistoryType,
  type Statistics,
} from '@/lib/db/schema'
import {
  formatRelativeTime,
  formatPlayTime,
  formatGameMode,
  formatDifficulty,
  formatDeathCause,
} from '@/lib/utils/format'

export default function GameHistory() {
  const [history, setHistory] = useState<GameHistoryType[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true)
        const [historyData, statsData] = await Promise.all([
          getGameHistory(50),
          getStatistics(),
        ])
        setHistory(historyData)
        setStatistics(statsData)
        setError(null)
      } catch (err) {
        console.error('Failed to load history:', err)
        setError('履歴の読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">まだゲームをプレイしていません</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">ゲーム履歴</h2>

      {/* Statistics Summary */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">総プレイ回数</div>
            <div className="text-2xl font-bold text-cyan-400">
              {statistics.totalGames}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">最高スコア</div>
            <div className="text-2xl font-bold text-yellow-400">
              {statistics.highestScore}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">平均スコア</div>
            <div className="text-2xl font-bold text-green-400">
              {statistics.averageScore.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">総プレイ時間</div>
            <div className="text-2xl font-bold text-purple-400">
              {formatPlayTime(statistics.totalPlayTime)}
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="space-y-3">
        {history.map((game) => (
          <div
            key={game.id}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-2">
                <span className="text-sm px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded">
                  {formatGameMode(game.mode)}
                </span>
                <span className="text-sm px-2 py-1 bg-gray-700 text-gray-300 rounded">
                  {formatDifficulty(game.difficulty)}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {formatRelativeTime(game.timestamp)}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-gray-400">スコア</div>
                <div
                  className="text-lg font-bold text-cyan-400"
                  data-testid="history-score"
                >
                  {game.finalScore}
                </div>
              </div>
              <div>
                <div className="text-gray-400">レベル</div>
                <div className="text-lg font-bold text-white">
                  {game.finalLevel}
                </div>
              </div>
              <div>
                <div className="text-gray-400">生存時間</div>
                <div className="text-lg font-bold text-white">
                  {formatPlayTime(game.survivalTime)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">食べた餌</div>
                <div className="text-lg font-bold text-white">
                  {game.foodsEaten}個
                </div>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-400">
              {formatDeathCause(game.deathCause)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
