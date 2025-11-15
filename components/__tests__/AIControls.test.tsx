/**
 * AIControlsコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react'
import AIControls from '../AIControls'
import type { Snake } from '@/lib/types/game'

describe('AIControls', () => {
  const mockOnStartBattle = jest.fn()
  const mockPlayerSnake: Snake = {
    id: 'player',
    body: [{ x: 5, y: 5 }],
    direction: 'right',
    nextDirection: 'right',
    color: '#10b981',
    score: 100,
    alive: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render AI FIGHT button when battle not started', () => {
      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={null}
          gameStatus="playing"
        />
      )

      expect(screen.getByText(/AI FIGHT/i)).toBeInTheDocument()
    })

    it('should display player score', () => {
      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={null}
          gameStatus="playing"
        />
      )

      expect(screen.getByText('Player')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should display AI score when AI snake exists', () => {
      const mockAISnake: Snake = {
        id: 'ai',
        body: [{ x: 15, y: 15 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 80,
        alive: true,
      }

      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={mockAISnake}
          gameStatus="playing"
        />
      )

      expect(screen.getByText('AI')).toBeInTheDocument()
      expect(screen.getByText('80')).toBeInTheDocument()
    })

    it('should not render AI FIGHT button when battle already started', () => {
      const mockAISnake: Snake = {
        id: 'ai',
        body: [{ x: 15, y: 15 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 80,
        alive: true,
      }

      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={mockAISnake}
          gameStatus="playing"
        />
      )

      expect(screen.queryByText(/AI FIGHT/i)).not.toBeInTheDocument()
    })

    it('should disable button when game is over', () => {
      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={null}
          gameStatus="gameOver"
        />
      )

      const button = screen.getByText(/AI FIGHT/i)
      expect(button).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('should call onStartBattle when AI FIGHT button is clicked', () => {
      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={null}
          gameStatus="playing"
        />
      )

      const button = screen.getByText(/AI FIGHT/i)
      fireEvent.click(button)

      expect(mockOnStartBattle).toHaveBeenCalledTimes(1)
    })

    it('should not call onStartBattle when button is disabled', () => {
      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={null}
          gameStatus="gameOver"
        />
      )

      const button = screen.getByText(/AI FIGHT/i)
      fireEvent.click(button)

      expect(mockOnStartBattle).not.toHaveBeenCalled()
    })
  })

  describe('Score Comparison', () => {
    it('should highlight player when player has higher score', () => {
      const mockAISnake: Snake = {
        id: 'ai',
        body: [{ x: 15, y: 15 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 50,
        alive: true,
      }

      const { container } = render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={mockAISnake}
          gameStatus="playing"
        />
      )

      // Check if player score has highlighting class
      const playerScore = screen.getByText('Player').closest('div')
      expect(playerScore?.className).toMatch(/font-bold/)
      expect(playerScore?.className).toMatch(/text-green/)
    })

    it('should highlight AI when AI has higher score', () => {
      const mockAISnake: Snake = {
        id: 'ai',
        body: [{ x: 15, y: 15 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 150,
        alive: true,
      }

      const { container } = render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={mockAISnake}
          gameStatus="playing"
        />
      )

      // Check if AI score has highlighting class
      const aiScore = screen.getByText('AI').closest('div')
      expect(aiScore?.className).toMatch(/font-bold/)
      expect(aiScore?.className).toMatch(/text-red/)
    })
  })

  describe('Winner Display', () => {
    it('should show winner message when player wins', () => {
      const mockAISnake: Snake = {
        id: 'ai',
        body: [{ x: 15, y: 15 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 50,
        alive: false,
      }

      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={mockPlayerSnake}
          aiSnake={mockAISnake}
          gameStatus="gameOver"
          winner="player"
        />
      )

      expect(screen.getByText(/Player Wins!/i)).toBeInTheDocument()
    })

    it('should show winner message when AI wins', () => {
      const mockAISnake: Snake = {
        id: 'ai',
        body: [{ x: 15, y: 15 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 150,
        alive: true,
      }

      const deadPlayerSnake: Snake = {
        ...mockPlayerSnake,
        alive: false,
      }

      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={deadPlayerSnake}
          aiSnake={mockAISnake}
          gameStatus="gameOver"
          winner="ai"
        />
      )

      expect(screen.getByText(/AI Wins!/i)).toBeInTheDocument()
    })

    it('should show draw message when both have same score', () => {
      const mockAISnake: Snake = {
        id: 'ai',
        body: [{ x: 15, y: 15 }],
        direction: 'up',
        nextDirection: 'up',
        color: '#ef4444',
        score: 100,
        alive: false,
      }

      const deadPlayerSnake: Snake = {
        ...mockPlayerSnake,
        alive: false,
      }

      render(
        <AIControls
          onStartBattle={mockOnStartBattle}
          playerSnake={deadPlayerSnake}
          aiSnake={mockAISnake}
          gameStatus="gameOver"
          winner="draw"
        />
      )

      expect(screen.getByText(/Draw!/i)).toBeInTheDocument()
    })
  })
})
