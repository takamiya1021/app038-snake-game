'use client'

/**
 * AI分析パネル
 */

import { useEffect, useState, useTransition } from 'react'
import AnalysisReport from './AnalysisReport'
import {
  analyzeSnakePlayStyle,
  type AnalysisResult,
} from '@/app/actions/ai'
import type { PlayData } from '@/lib/game/analytics'

interface AIAnalysisPanelProps {
  playData: PlayData | null
}

export default function AIAnalysisPanel({ playData }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [isKeyLoaded, setIsKeyLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('snake-gemini-api-key')
    if (stored) {
      setApiKey(stored)
    }
    setIsKeyLoaded(true)
  }, [])

  const persistApiKey = (value: string) => {
    setApiKey(value)
    if (typeof window === 'undefined') return
    if (value) {
      window.localStorage.setItem('snake-gemini-api-key', value)
    } else {
      window.localStorage.removeItem('snake-gemini-api-key')
    }
  }

  const handleClearKey = () => {
    persistApiKey('')
  }

  const handleAnalyze = () => {
    if (!playData) return
    if (!apiKey) {
      setError('Gemini APIキーを入力してください。')
      return
    }

    startTransition(async () => {
      try {
        setError(null)
        const result = await analyzeSnakePlayStyle(playData, apiKey)
        setAnalysis(result)
      } catch (err) {
        console.error('Failed to run AI analysis', err)
        setError('AI分析に失敗しました。時間をおいて再試行してください。')
      }
    })
  }

  const disabled = !playData || isPending || !apiKey

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900/40 border border-purple-500/30 rounded-xl">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
            <span>🤖</span>
            <span>AIプレイ分析</span>
          </h3>
          <p className="text-sm text-gray-400">
            最新のプレイをGeminiに送信して、強みと改善ポイントを確認できます。APIキーはブラウザのローカルストレージにのみ保存されます。
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            Gemini API Key
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => persistApiKey(e.target.value)}
              placeholder="AIz..."
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!isKeyLoaded}
            />
            <button
              type="button"
              onClick={handleClearKey}
              disabled={!apiKey}
              className={`px-4 py-2 text-sm rounded-lg border ${
                apiKey
                  ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                  : 'border-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              クリア
            </button>
          </div>
          <p className="text-xs text-gray-500">
            ※ 入力したキーはこのブラウザのローカルストレージに保存され、サーバー側には保持されません。
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={disabled}
          className={`w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            disabled
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-500'
          }`}
        >
          {isPending ? '分析中...' : 'AIに分析してもらう'}
        </button>
      </div>

      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

      {!playData && (
        <p className="text-sm text-gray-400 mt-3">
          ゲームオーバーになるとAI分析が利用できます。
        </p>
      )}

      {analysis && playData && (
        <div className="mt-6">
          <AnalysisReport playData={playData} analysis={analysis} />
        </div>
      )}
    </div>
  )
}
