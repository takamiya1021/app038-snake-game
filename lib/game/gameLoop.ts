/**
 * ゲームループ実装
 * requestAnimationFrameを使用して60fpsを維持
 */

import type { GameState } from '@/lib/types/game'
import { BASE_UPDATE_INTERVAL } from '@/lib/utils/constants'

export class GameLoop {
  private state: GameState
  private running: boolean = false
  private animationFrameId: number | null = null
  private lastUpdateTime: number = 0
  private updateCallback: ((state: GameState) => void) | null = null

  constructor(initialState: GameState) {
    this.state = { ...initialState }
  }

  /**
   * ゲームループを開始
   */
  start(): void {
    if (this.running) return

    this.running = true
    this.state = {
      ...this.state,
      status: 'playing',
    }
    this.lastUpdateTime = performance.now()
    this.loop(performance.now())
  }

  /**
   * ゲームループを停止
   */
  stop(): void {
    this.running = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * ゲームを一時停止
   */
  pause(): void {
    this.running = false
    this.state = {
      ...this.state,
      status: 'paused',
    }
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * ゲームを再開
   */
  resume(): void {
    if (this.state.status !== 'paused') return

    this.running = true
    this.state = {
      ...this.state,
      status: 'playing',
    }
    this.lastUpdateTime = performance.now()
    this.loop(performance.now())
  }

  /**
   * メインループ（60fps）
   */
  private loop(currentTime: number): void {
    if (!this.running) return

    const deltaTime = currentTime - this.lastUpdateTime
    const updateInterval = BASE_UPDATE_INTERVAL / this.state.speed

    // 指定された更新間隔に達したら更新
    if (deltaTime >= updateInterval) {
      this.update()
      this.lastUpdateTime = currentTime
    }

    // 次のフレームを予約（60fps維持）
    this.animationFrameId = requestAnimationFrame((time) => this.loop(time))
  }

  /**
   * ゲーム状態の更新
   */
  private update(): void {
    if (this.updateCallback) {
      this.updateCallback(this.state)
    }
  }

  /**
   * 更新コールバックを設定
   */
  setUpdateCallback(callback: (state: GameState) => void): void {
    this.updateCallback = callback
  }

  /**
   * 現在のゲーム状態を取得
   */
  getState(): GameState {
    return { ...this.state }
  }

  /**
   * ゲーム状態を設定
   */
  setState(newState: GameState): void {
    this.state = { ...newState }
  }

  /**
   * ゲームループが実行中かどうか
   */
  isRunning(): boolean {
    return this.running
  }
}
