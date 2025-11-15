/**
 * ゲーム関連の型定義
 */

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Position {
  x: number
  y: number
}

export interface Snake {
  id: 'player' | 'ai'
  body: Position[]
  direction: Direction
  nextDirection: Direction
  color: string
  score: number
  alive: boolean
}

export interface Food {
  id: string
  position: Position
  type: 'normal' | 'special' | 'speedBoost' | 'scoreDouble' | 'shrink'
  points: number
  effect?: FoodEffect
  expiresAt?: number
}

export interface FoodEffect {
  type: 'speed' | 'score' | 'shrink'
  duration: number
  multiplier?: number
}

export interface Grid {
  width: number
  height: number
}

export type GameMode = 'classic' | 'timeAttack' | 'endless' | 'aiBattle'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameOver'

export interface GameState {
  mode: GameMode
  difficulty: Difficulty
  status: GameStatus
  score: number
  level: number
  speed: number
  timeLeft: number
  grid: Grid
  snake: Snake
  aiSnake: Snake | null
  foods: Food[]
  leveledUp?: boolean
}
