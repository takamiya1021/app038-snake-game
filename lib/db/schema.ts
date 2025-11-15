/**
 * IndexedDB スキーマ定義（Dexie.js）
 */

import Dexie, { type Table } from 'dexie'
import type { PlayData } from '@/lib/game/analytics'

/**
 * ゲーム履歴のインターフェース
 */
export interface GameHistory extends PlayData {
  id?: number // Auto-incrementing primary key
  timestamp: number // プレイ日時（Unix timestamp）
}

/**
 * データベースクラス
 */
export class SnakeGameDB extends Dexie {
  gameHistory!: Table<GameHistory, number>

  constructor() {
    super('SnakeGameDB')

    // スキーマ定義
    this.version(1).stores({
      gameHistory:
        '++id, timestamp, finalScore, mode, difficulty, survivalTime',
    })
  }
}

// シングルトンインスタンス
export const db = new SnakeGameDB()

/**
 * ゲーム履歴を保存
 * @param playData プレイデータ
 * @returns 保存されたレコードのID
 */
export async function saveGameHistory(
  playData: PlayData
): Promise<number | undefined> {
  try {
    const history: GameHistory = {
      ...playData,
      timestamp: Date.now(),
    }

    const id = await db.gameHistory.add(history)
    return id
  } catch (error) {
    console.error('Failed to save game history:', error)
    return undefined
  }
}

/**
 * 全ゲーム履歴を取得（新しい順）
 * @param limit 取得件数（デフォルト: 100）
 * @returns ゲーム履歴の配列
 */
export async function getGameHistory(
  limit: number = 100
): Promise<GameHistory[]> {
  try {
    return await db.gameHistory
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray()
  } catch (error) {
    console.error('Failed to get game history:', error)
    return []
  }
}

/**
 * 最高スコアを取得
 * @returns 最高スコアのゲーム履歴
 */
export async function getHighScore(): Promise<GameHistory | undefined> {
  try {
    return await db.gameHistory.orderBy('finalScore').reverse().first()
  } catch (error) {
    console.error('Failed to get high score:', error)
    return undefined
  }
}

/**
 * モード別の履歴を取得
 * @param mode ゲームモード
 * @param limit 取得件数
 * @returns ゲーム履歴の配列
 */
export async function getHistoryByMode(
  mode: PlayData['mode'],
  limit: number = 50
): Promise<GameHistory[]> {
  try {
    return await db.gameHistory
      .where('mode')
      .equals(mode)
      .reverse()
      .limit(limit)
      .toArray()
  } catch (error) {
    console.error('Failed to get history by mode:', error)
    return []
  }
}

/**
 * 統計情報の型定義
 */
export interface Statistics {
  totalGames: number
  totalScore: number
  averageScore: number
  highestScore: number
  totalPlayTime: number
}

/**
 * 統計情報を取得
 * @returns 統計情報
 */
export async function getStatistics(): Promise<Statistics> {
  try {
    const allHistory = await db.gameHistory.toArray()

    const totalGames = allHistory.length
    const totalScore = allHistory.reduce(
      (sum, game) => sum + game.finalScore,
      0
    )
    const averageScore = totalGames > 0 ? totalScore / totalGames : 0
    const highestScore =
      allHistory.length > 0
        ? Math.max(...allHistory.map((game) => game.finalScore))
        : 0
    const totalPlayTime = allHistory.reduce(
      (sum, game) => sum + game.survivalTime,
      0
    )

    return {
      totalGames,
      totalScore,
      averageScore,
      highestScore,
      totalPlayTime,
    }
  } catch (error) {
    console.error('Failed to get statistics:', error)
    return {
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      highestScore: 0,
      totalPlayTime: 0,
    }
  }
}

/**
 * 古い履歴を削除（保持件数を制限）
 * @param keepCount 保持する件数
 */
export async function pruneOldHistory(keepCount: number = 1000): Promise<void> {
  try {
    const total = await db.gameHistory.count()

    if (total > keepCount) {
      const toDelete = total - keepCount
      const oldestRecords = await db.gameHistory
        .orderBy('timestamp')
        .limit(toDelete)
        .toArray()

      const idsToDelete = oldestRecords
        .map((record) => record.id)
        .filter((id): id is number => id !== undefined)

      await db.gameHistory.bulkDelete(idsToDelete)
    }
  } catch (error) {
    console.error('Failed to prune old history:', error)
  }
}

/**
 * 全履歴を削除
 */
export async function clearAllHistory(): Promise<void> {
  try {
    await db.gameHistory.clear()
  } catch (error) {
    console.error('Failed to clear all history:', error)
  }
}
