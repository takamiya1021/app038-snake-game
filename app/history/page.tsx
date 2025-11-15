/**
 * 履歴ページ
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GameHistory from '@/components/GameHistory'
import ScoreGraph from '@/components/ScoreGraph'
import { getGameHistory } from '@/lib/db/schema'
import type { GameHistory as GameHistoryType } from '@/lib/db/schema'

export default function HistoryPage() {
  const [history, setHistory] = useState<GameHistoryType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getGameHistory(50)
        setHistory(data)
      } catch (error) {
        console.error('Failed to load history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-cyan-400">プレイ履歴</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              ゲームに戻る
            </Link>
          </div>
          <p className="text-gray-400 mt-2">
            過去のゲーム記録とスコア推移を確認できます
          </p>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">読み込み中...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* グラフセクション */}
            {history.length > 0 && (
              <section>
                <ScoreGraph history={history} />
              </section>
            )}

            {/* 履歴セクション */}
            <section>
              <GameHistory />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
