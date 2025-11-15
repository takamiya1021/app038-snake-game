/**
 * AnalysisReportコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react'
import AnalysisReport from '../AnalysisReport'
import type { AnalysisResult } from '@/app/actions/ai'
import type { PlayData } from '@/lib/game/analytics'

describe('AnalysisReport', () => {
  const mockPlayData: PlayData = {
    survivalTime: 30000,
    finalScore: 150,
    finalLevel: 3,
    foodsEaten: 15,
    deathCause: 'wall',
    scoreEfficiency: 5.0,
    avgScorePerFood: 10.0,
    mode: 'classic',
    difficulty: 'easy',
  }

  const mockAnalysisResult: AnalysisResult = {
    summary: 'まずまずのプレイでした。スコア効率を上げることで更に高得点が狙えます。',
    strengths: [
      '15個の餌を食べました',
      'レベル3に到達しました',
      '30秒間生き延びました',
    ],
    weaknesses: ['壁に衝突してゲームオーバーになりました', 'スコア効率が低めです'],
    tips: [
      '端に近づいたら早めに方向転換しましょう',
      '積極的に餌を取りに行きましょう',
      '蛇の動きを予測して移動しましょう',
    ],
    scoreGrade: 'B',
  }

  describe('Rendering', () => {
    it('should display play statistics', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(screen.getByText('スコア')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('レベル')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('餌')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('should display score grade', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(screen.getByText('B')).toBeInTheDocument()
    })

    it('should display summary', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(screen.getByText(/まずまずのプレイでした/i)).toBeInTheDocument()
    })

    it('should display strengths', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(screen.getByText(/15個の餌を食べました/i)).toBeInTheDocument()
      expect(screen.getByText(/レベル3に到達しました/i)).toBeInTheDocument()
    })

    it('should display weaknesses', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(
        screen.getByText(/壁に衝突してゲームオーバーになりました/i)
      ).toBeInTheDocument()
    })

    it('should display tips', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(
        screen.getByText(/端に近づいたら早めに方向転換しましょう/i)
      ).toBeInTheDocument()
    })
  })

  describe('Score Grade Display', () => {
    it('should display S grade with gold color', () => {
      const sGradeAnalysis = { ...mockAnalysisResult, scoreGrade: 'S' as const }
      const { container } = render(
        <AnalysisReport playData={mockPlayData} analysis={sGradeAnalysis} />
      )

      const gradeElement = screen.getByText('S')
      expect(gradeElement.className).toMatch(/yellow|gold/)
    })

    it('should display A grade with green color', () => {
      const aGradeAnalysis = { ...mockAnalysisResult, scoreGrade: 'A' as const }
      const { container } = render(
        <AnalysisReport playData={mockPlayData} analysis={aGradeAnalysis} />
      )

      const gradeElement = screen.getByText('A')
      expect(gradeElement.className).toMatch(/green/)
    })

    it('should display C grade with orange color', () => {
      const cGradeAnalysis = { ...mockAnalysisResult, scoreGrade: 'C' as const }
      const { container } = render(
        <AnalysisReport playData={mockPlayData} analysis={cGradeAnalysis} />
      )

      const gradeElement = screen.getByText('C')
      expect(gradeElement.className).toMatch(/orange/)
    })

    it('should display D grade with red color', () => {
      const dGradeAnalysis = { ...mockAnalysisResult, scoreGrade: 'D' as const }
      const { container } = render(
        <AnalysisReport playData={mockPlayData} analysis={dGradeAnalysis} />
      )

      const gradeElement = screen.getByText('D')
      expect(gradeElement.className).toMatch(/red/)
    })
  })

  describe('Death Cause Display', () => {
    it('should display wall death cause', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(screen.getByText(/壁衝突/i)).toBeInTheDocument()
    })

    it('should display self death cause', () => {
      const playDataWithSelfDeath = { ...mockPlayData, deathCause: 'self' as const }
      render(
        <AnalysisReport
          playData={playDataWithSelfDeath}
          analysis={mockAnalysisResult}
        />
      )

      expect(screen.getByText(/自己衝突/i)).toBeInTheDocument()
    })

    it('should display AI death cause', () => {
      const playDataWithAIDeath = {
        ...mockPlayData,
        deathCause: 'ai' as const,
        mode: 'aiBattle' as const,
      }
      render(
        <AnalysisReport
          playData={playDataWithAIDeath}
          analysis={mockAnalysisResult}
        />
      )

      expect(screen.getByText('AI対戦敗北')).toBeInTheDocument()
    })
  })

  describe('Statistics Display', () => {
    it('should display survival time in seconds', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(screen.getByText('30秒')).toBeInTheDocument()
    })

    it('should display score efficiency', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(screen.getByText(/5\.0/i)).toBeInTheDocument()
    })

    it('should display average score per food', () => {
      render(
        <AnalysisReport playData={mockPlayData} analysis={mockAnalysisResult} />
      )

      expect(screen.getByText(/10\.0/i)).toBeInTheDocument()
    })
  })
})
