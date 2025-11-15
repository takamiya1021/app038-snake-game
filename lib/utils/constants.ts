/**
 * ゲームの定数定義
 */

// グリッドサイズ
export const GRID_WIDTH = 20
export const GRID_HEIGHT = 20

// 初期速度（ms）
export const BASE_UPDATE_INTERVAL = 100 // 100ms = 10fps（蛇の移動速度）

// 難易度による速度倍率
export const DIFFICULTY_SPEED = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
} as const

// レベルアップ設定
export const SCORE_PER_LEVEL = 500
export const SPEED_INCREASE_PER_LEVEL = 0.2
export const MAX_LEVEL = 10
export const MAX_SPEED = 4.0

// 餌のポイント
export const NORMAL_FOOD_POINTS = 10
export const SPECIAL_FOOD_POINTS = 50

// 蛇の初期位置
export const INITIAL_SNAKE_LENGTH = 3
export const PLAYER_SNAKE_COLOR = '#10b981' // 緑
export const AI_SNAKE_COLOR = '#3b82f6' // 青

// 蛇の初期位置（中央）
export const INITIAL_PLAYER_POSITION = {
  x: Math.floor(GRID_WIDTH / 2),
  y: Math.floor(GRID_HEIGHT / 2),
}
