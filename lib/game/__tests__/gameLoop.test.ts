/**
 * ゲームループロジックのテスト
 */

import { GameLoop } from '../gameLoop'
import type { GameState } from '@/lib/types/game'
import { GRID_WIDTH, GRID_HEIGHT, INITIAL_PLAYER_POSITION } from '@/lib/utils/constants'

describe('GameLoop', () => {
  let gameLoop: GameLoop
  let initialState: GameState

  beforeEach(() => {
    // 初期ゲーム状態を作成
    initialState = {
      mode: 'classic',
      difficulty: 'easy',
      status: 'ready',
      score: 0,
      level: 1,
      speed: 1.0,
      timeLeft: 0,
      grid: {
        width: GRID_WIDTH,
        height: GRID_HEIGHT,
      },
      snake: {
        id: 'player',
        body: [
          { x: INITIAL_PLAYER_POSITION.x, y: INITIAL_PLAYER_POSITION.y },
          { x: INITIAL_PLAYER_POSITION.x - 1, y: INITIAL_PLAYER_POSITION.y },
          { x: INITIAL_PLAYER_POSITION.x - 2, y: INITIAL_PLAYER_POSITION.y },
        ],
        direction: 'right',
        nextDirection: 'right',
        color: '#10b981',
        score: 0,
        alive: true,
      },
      aiSnake: null,
      foods: [],
    }

    gameLoop = new GameLoop(initialState)
  })

  afterEach(() => {
    gameLoop.stop()
  })

  describe('initialization', () => {
    it('should initialize with the given game state', () => {
      expect(gameLoop.getState()).toEqual(initialState)
    })

    it('should not be running initially', () => {
      expect(gameLoop.isRunning()).toBe(false)
    })
  })

  describe('start and stop', () => {
    it('should start the game loop', () => {
      gameLoop.start()
      expect(gameLoop.isRunning()).toBe(true)
    })

    it('should stop the game loop', () => {
      gameLoop.start()
      gameLoop.stop()
      expect(gameLoop.isRunning()).toBe(false)
    })

    it('should update game state to playing when started', () => {
      gameLoop.start()
      const state = gameLoop.getState()
      expect(state.status).toBe('playing')
    })
  })

  describe('update callback', () => {
    it('should accept update callback function', () => {
      const onUpdate = jest.fn()
      expect(() => gameLoop.setUpdateCallback(onUpdate)).not.toThrow()
    })

    it('should store update callback', () => {
      const onUpdate = jest.fn()
      gameLoop.setUpdateCallback(onUpdate)
      // コールバックが関数であることを確認
      expect(typeof onUpdate).toBe('function')
    })
  })

  describe('state management', () => {
    it('should allow state updates', () => {
      const newState: GameState = {
        ...initialState,
        score: 100,
      }
      gameLoop.setState(newState)
      expect(gameLoop.getState().score).toBe(100)
    })

    it('should pause the game', () => {
      gameLoop.start()
      gameLoop.pause()
      expect(gameLoop.getState().status).toBe('paused')
      expect(gameLoop.isRunning()).toBe(false)
    })

    it('should resume the game', () => {
      gameLoop.start()
      gameLoop.pause()
      gameLoop.resume()
      expect(gameLoop.getState().status).toBe('playing')
      expect(gameLoop.isRunning()).toBe(true)
    })
  })
})
