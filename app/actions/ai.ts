/**
 * AI分析Server Action
 */

'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { PlayData } from '@/lib/game/analytics'

/**
 * AI分析結果の型定義
 */
export interface AnalysisResult {
  summary: string // 総合評価
  strengths: string[] // 良かった点
  weaknesses: string[] // 改善点
  tips: string[] // 具体的なアドバイス
  scoreGrade: 'S' | 'A' | 'B' | 'C' | 'D' // スコアランク
}

/**
 * スコアからランクを計算
 * @param score スコア
 * @returns ランク
 */
function calculateScoreGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 500) return 'S'
  if (score >= 300) return 'A'
  if (score >= 150) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

/**
 * プレイデータをAIで分析
 * @param playData プレイデータ
 * @returns 分析結果
 */
export async function analyzeSnakePlayStyle(
  playData: PlayData,
  apiKeyOverride?: string
): Promise<AnalysisResult> {
  const apiKey = apiKeyOverride?.trim() || process.env.GEMINI_API_KEY

  // APIキーがない場合は簡易分析を返す
  if (!apiKey) {
    return generateFallbackAnalysis(playData)
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = createAnalysisPrompt(playData)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // AIの応答をパース
    return parseAIResponse(text, playData)
  } catch (error) {
    console.error('AI analysis error:', error)
    // エラー時はフォールバック分析を返す
    return generateFallbackAnalysis(playData)
  }
}

/**
 * AI分析用のプロンプトを生成
 * @param playData プレイデータ
 * @returns プロンプト
 */
function createAnalysisPrompt(playData: PlayData): string {
  const survivalSeconds = Math.floor(playData.survivalTime / 1000)

  return `
あなたはスネークゲームのエキスパートコーチです。以下のプレイデータを分析し、プレイヤーにアドバイスをしてください。

【プレイデータ】
- 最終スコア: ${playData.finalScore}点
- 到達レベル: レベル${playData.finalLevel}
- 生存時間: ${survivalSeconds}秒
- 食べた餌: ${playData.foodsEaten}個
- 死因: ${getDeathCauseText(playData.deathCause)}
- スコア効率: ${playData.scoreEfficiency.toFixed(2)}点/秒
- 餌あたりの平均スコア: ${playData.avgScorePerFood.toFixed(2)}点/餌
- モード: ${getModeText(playData.mode)}
- 難易度: ${getDifficultyText(playData.difficulty)}

以下の形式で分析結果を返してください：

【総合評価】
（1-2文で全体的な評価）

【良かった点】
- （良かった点1）
- （良かった点2）
- （良かった点3）

【改善点】
- （改善点1）
- （改善点2）
- （改善点3）

【具体的なアドバイス】
- （具体的なアドバイス1）
- （具体的なアドバイス2）
- （具体的なアドバイス3）

簡潔で分かりやすく、ポジティブかつ建設的なフィードバックをお願いします。
`
}

/**
 * AIの応答をパース
 * @param text AIの応答テキスト
 * @param playData プレイデータ
 * @returns 分析結果
 */
function parseAIResponse(text: string, playData: PlayData): AnalysisResult {
  const lines = text.split('\n').filter((line) => line.trim())

  let summary = ''
  const strengths: string[] = []
  const weaknesses: string[] = []
  const tips: string[] = []

  let currentSection = ''

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.includes('総合評価')) {
      currentSection = 'summary'
      continue
    } else if (trimmed.includes('良かった点')) {
      currentSection = 'strengths'
      continue
    } else if (trimmed.includes('改善点')) {
      currentSection = 'weaknesses'
      continue
    } else if (trimmed.includes('アドバイス')) {
      currentSection = 'tips'
      continue
    }

    // セクション見出し行はスキップ
    if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
      continue
    }

    if (currentSection === 'summary' && !trimmed.startsWith('-')) {
      summary += trimmed + ' '
    } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      const content = trimmed.replace(/^[-•]\s*/, '').trim()
      if (content) {
        if (currentSection === 'strengths') {
          strengths.push(content)
        } else if (currentSection === 'weaknesses') {
          weaknesses.push(content)
        } else if (currentSection === 'tips') {
          tips.push(content)
        }
      }
    }
  }

  return {
    summary: summary.trim() || '分析結果を取得できませんでした',
    strengths:
      strengths.length > 0
        ? strengths
        : ['プレイデータを収集できました'],
    weaknesses:
      weaknesses.length > 0 ? weaknesses : ['さらなる上達を目指しましょう'],
    tips: tips.length > 0 ? tips : ['練習を続けてください'],
    scoreGrade: calculateScoreGrade(playData.finalScore),
  }
}

/**
 * フォールバック分析を生成（API未設定時）
 * @param playData プレイデータ
 * @returns 分析結果
 */
function generateFallbackAnalysis(playData: PlayData): AnalysisResult {
  const survivalSeconds = Math.floor(playData.survivalTime / 1000)
  const scoreGrade = calculateScoreGrade(playData.finalScore)

  const strengths: string[] = []
  const weaknesses: string[] = []
  const tips: string[] = []

  // スコアに応じた評価
  if (playData.finalScore >= 200) {
    strengths.push('高いスコアを獲得しました！')
  } else if (playData.finalScore >= 100) {
    strengths.push('まずまずのスコアです')
  }

  // 生存時間の評価
  if (survivalSeconds >= 60) {
    strengths.push('長時間生き延びることができました')
  }

  // 餌取得数の評価
  if (playData.foodsEaten >= 10) {
    strengths.push(`${playData.foodsEaten}個の餌を食べました`)
  }

  // 死因に応じたアドバイス
  if (playData.deathCause === 'wall') {
    weaknesses.push('壁に衝突してゲームオーバーになりました')
    tips.push('端に近づいたら早めに方向転換しましょう')
  } else if (playData.deathCause === 'self') {
    weaknesses.push('自分の体に衝突してゲームオーバーになりました')
    tips.push('蛇の長さを意識して、安全なルートを選びましょう')
  } else if (playData.deathCause === 'ai') {
    weaknesses.push('AIとの対戦で敗北しました')
    tips.push('AIの動きを予測して、餌を先取りしましょう')
  }

  // スコア効率の評価
  if (playData.scoreEfficiency < 5) {
    weaknesses.push('スコア効率が低めです')
    tips.push('積極的に餌を取りに行きましょう')
  }

  // デフォルトアドバイス
  if (tips.length === 0) {
    tips.push('練習を重ねて、さらなる高スコアを目指しましょう')
  }

  // デフォルトの長所
  if (strengths.length === 0) {
    strengths.push('ゲームを完走しました')
  }

  // デフォルトの改善点
  if (weaknesses.length === 0) {
    weaknesses.push('さらなる上達を目指しましょう')
  }

  const summary = `スコア ${playData.finalScore}点（ランク: ${scoreGrade}）を獲得しました。${survivalSeconds}秒間生存し、${playData.foodsEaten}個の餌を食べました。`

  return {
    summary,
    strengths,
    weaknesses,
    tips,
    scoreGrade,
  }
}

/**
 * 死因のテキスト表現を取得
 */
function getDeathCauseText(cause: PlayData['deathCause']): string {
  switch (cause) {
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

/**
 * モードのテキスト表現を取得
 */
function getModeText(mode: PlayData['mode']): string {
  switch (mode) {
    case 'classic':
      return 'クラシック'
    case 'timeAttack':
      return 'タイムアタック'
    case 'endless':
      return 'エンドレス'
    case 'aiBattle':
      return 'AI対戦'
    default:
      return mode
  }
}

/**
 * 難易度のテキスト表現を取得
 */
function getDifficultyText(difficulty: PlayData['difficulty']): string {
  switch (difficulty) {
    case 'easy':
      return '簡単'
    case 'medium':
      return '普通'
    case 'hard':
      return '難しい'
    default:
      return difficulty
  }
}
