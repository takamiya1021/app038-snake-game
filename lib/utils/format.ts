/**
 * フォーマットユーティリティ関数
 */

/**
 * タイムスタンプを相対時間に変換
 * @param timestamp タイムスタンプ
 * @returns 相対時間の文字列 (例: "10分前", "3時間前", "2日前")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) {
    return 'たった今'
  } else if (minutes < 60) {
    return `${minutes}分前`
  } else if (hours < 24) {
    return `${hours}時間前`
  } else {
    return `${days}日前`
  }
}

/**
 * ミリ秒を時間表示に変換
 * @param ms ミリ秒
 * @returns 時間表示文字列 (例: "2分30秒", "1時間15分")
 */
export function formatPlayTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}時間${remainingMinutes}分`
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  } else {
    return `${seconds}秒`
  }
}

/**
 * ゲームモードを日本語に変換
 * @param mode ゲームモード
 * @returns 日本語モード名
 */
export function formatGameMode(mode: string): string {
  switch (mode) {
    case 'normal':
      return '通常モード'
    case 'aiBattle':
      return 'AI対戦'
    default:
      return mode
  }
}

/**
 * 難易度を日本語に変換
 * @param difficulty 難易度
 * @returns 日本語難易度名
 */
export function formatDifficulty(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '簡単'
    case 'normal':
      return '普通'
    case 'hard':
      return '難しい'
    default:
      return difficulty
  }
}

/**
 * 死因を日本語に変換
 * @param deathCause 死因
 * @returns 日本語死因
 */
export function formatDeathCause(deathCause: string): string {
  switch (deathCause) {
    case 'wall':
      return '壁に衝突'
    case 'self':
      return '自分に衝突'
    case 'ai':
      return 'AIに敗北'
    default:
      return deathCause
  }
}
