/**
 * AI分析結果表示コンポーネント
 */

'use client'

import type { AnalysisResult } from '@/app/actions/ai'
import type { PlayData } from '@/lib/game/analytics'

interface AnalysisReportProps {
  playData: PlayData
  analysis: AnalysisResult
}

export default function AnalysisReport({
  playData,
  analysis,
}: AnalysisReportProps) {
  const survivalSeconds = Math.floor(playData.survivalTime / 1000)

  // スコアランクに応じた色を取得
  const getGradeColor = (grade: AnalysisResult['scoreGrade']) => {
    switch (grade) {
      case 'S':
        return 'text-yellow-400'
      case 'A':
        return 'text-green-400'
      case 'B':
        return 'text-blue-400'
      case 'C':
        return 'text-orange-400'
      case 'D':
        return 'text-red-400'
    }
  }

  // 死因のテキストを取得
  const getDeathCauseText = () => {
    switch (playData.deathCause) {
      case 'wall':
        return '壁衝突'
      case 'self':
        return '自己衝突'
      case 'ai':
        return 'AI対戦敗北'
      default:
        return '不明'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* スコアランク */}
      <div className="flex items-center justify-center">
        <div
          className={`text-8xl font-bold ${getGradeColor(analysis.scoreGrade)}`}
          style={{
            textShadow: '0 0 20px currentColor, 0 0 40px currentColor',
          }}
        >
          {analysis.scoreGrade}
        </div>
      </div>

      {/* 基本統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-gray-400 text-sm">スコア</div>
          <div className="text-2xl font-bold text-cyan-400">
            {playData.finalScore}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-gray-400 text-sm">レベル</div>
          <div className="text-2xl font-bold text-green-400">
            {playData.finalLevel}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-gray-400 text-sm">餌</div>
          <div className="text-2xl font-bold text-yellow-400">
            {playData.foodsEaten}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-gray-400 text-sm">生存時間</div>
          <div className="text-2xl font-bold text-purple-400">
            {survivalSeconds}秒
          </div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">死因</span>
          <span className="text-white font-semibold">
            {getDeathCauseText()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">スコア効率</span>
          <span className="text-white font-semibold">
            {playData.scoreEfficiency.toFixed(1)} 点/秒
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">餌あたりの平均スコア</span>
          <span className="text-white font-semibold">
            {playData.avgScorePerFood.toFixed(1)} 点/餌
          </span>
        </div>
      </div>

      {/* AI分析結果 */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 rounded-lg border-2 border-purple-500/50">
        <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
          <span>🤖</span>
          <span>AI分析結果</span>
        </h2>

        {/* 総合評価 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">総合評価</h3>
          <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* 良かった点 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            ✓ 良かった点
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span className="text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 改善点 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-orange-400 mb-2">
            ⚠ 改善点
          </h3>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">•</span>
                <span className="text-gray-300">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 具体的なアドバイス */}
        <div>
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">
            💡 具体的なアドバイス
          </h3>
          <ul className="space-y-2">
            {analysis.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span className="text-gray-300">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
