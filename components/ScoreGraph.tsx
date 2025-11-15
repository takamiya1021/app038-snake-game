/**
 * スコア推移グラフコンポーネント
 */

'use client'

import { useEffect, useRef } from 'react'
import type { GameHistory } from '@/lib/db/schema'

interface ScoreGraphProps {
  history: GameHistory[]
}

export default function ScoreGraph({ history }: ScoreGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // トレンド判定
  const getTrend = (): { direction: string; message: string } => {
    if (history.length < 2) {
      return { direction: '→', message: '安定しています' }
    }

    const recent = history.slice(0, Math.min(5, history.length))
    const scores = recent.map((h) => h.finalScore)
    const first = scores[scores.length - 1]
    const last = scores[0]
    const diff = last - first

    if (diff > 20) {
      return { direction: '↗', message: 'スコアが上昇中！' }
    } else if (diff < -20) {
      return { direction: '↘', message: '練習が必要かも' }
    } else {
      return { direction: '→', message: '安定しています' }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || history.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas サイズ設定
    const parent = canvas.parentElement
    if (!parent) return

    canvas.width = parent.clientWidth
    canvas.height = 300

    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // スコアの範囲を計算
    const scores = history.map((h) => h.finalScore)
    const minScore = Math.min(...scores)
    const maxScore = Math.max(...scores)
    const scoreRange = maxScore - minScore || 1
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

    // 背景
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, width, height)

    // グリッド線
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1

    // 横線（スコア）
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - padding * 2) / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // 縦線（時間）
    const steps = Math.min(history.length, 10)
    for (let i = 0; i <= steps; i++) {
      const x = padding + ((width - padding * 2) / steps) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // 平均線
    const avgY =
      height -
      padding -
      ((avgScore - minScore) / scoreRange) * (height - padding * 2)
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding, avgY)
    ctx.lineTo(width - padding, avgY)
    ctx.stroke()
    ctx.setLineDash([])

    // スコアライン
    ctx.strokeStyle = '#06b6d4'
    ctx.lineWidth = 3
    ctx.beginPath()

    history.forEach((game, index) => {
      const x =
        width -
        padding -
        (index / (history.length - 1 || 1)) * (width - padding * 2)
      const y =
        height -
        padding -
        ((game.finalScore - minScore) / scoreRange) * (height - padding * 2)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // データポイント
    history.forEach((game, index) => {
      const x =
        width -
        padding -
        (index / (history.length - 1 || 1)) * (width - padding * 2)
      const y =
        height -
        padding -
        ((game.finalScore - minScore) / scoreRange) * (height - padding * 2)

      ctx.fillStyle = '#06b6d4'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      // 最高・最低スコアにマーカー
      if (game.finalScore === maxScore) {
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      }
      if (game.finalScore === minScore) {
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // 軸ラベル
    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'

    // Y軸ラベル（スコア）
    for (let i = 0; i <= 5; i++) {
      const score = maxScore - (scoreRange / 5) * i
      const y = padding + ((height - padding * 2) / 5) * i
      ctx.fillText(Math.round(score).toString(), padding - 10, y + 4)
    }
  }, [history])

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">データがありません</div>
      </div>
    )
  }

  const trend = getTrend()
  const scores = history.map((h) => h.finalScore)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const avgScore = (
    scores.reduce((a, b) => a + b, 0) / scores.length
  ).toFixed(0)

  return (
    <div data-testid="score-graph" className="w-full">
      <h3 className="text-xl font-bold mb-4 text-cyan-400">スコア推移</h3>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-4">
        <canvas
          ref={canvasRef}
          aria-label="スコア推移グラフ"
          role="img"
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-sm text-gray-400">最高</div>
          <div className="text-lg font-bold text-yellow-400">最高: {maxScore}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-sm text-gray-400">最低</div>
          <div className="text-lg font-bold text-red-400">最低: {minScore}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-sm text-gray-400">平均</div>
          <div className="text-lg font-bold text-green-400">
            平均: {avgScore}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-sm text-gray-400">トレンド</div>
          <div className="text-lg font-bold text-cyan-400">
            {trend.direction} {trend.message}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400 text-center">
        最近{history.length}ゲーム • スコア範囲: {minScore}〜{maxScore}
      </div>
    </div>
  )
}
