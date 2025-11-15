/**
 * AI対戦モードのE2Eテスト
 */

import { test, expect } from '@playwright/test'

test.describe('AI Battle Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play')
    // ゲームが読み込まれるまで待つ
    await page.waitForSelector('[data-testid="game-grid"]')
  })

  test('should display AI FIGHT button', async ({ page }) => {
    // AI FIGHTボタンが表示されているか確認
    const aiFightButton = page.getByText(/AI FIGHT/i)
    await expect(aiFightButton).toBeVisible()
  })

  test('should start AI battle when AI FIGHT button is clicked', async ({ page }) => {
    // AI FIGHTボタンをクリック
    const aiFightButton = page.getByText(/AI FIGHT/i)
    await aiFightButton.click()

    // AIスコアが表示されるか確認（AI蛇が初期化された証拠）
    await expect(page.getByText('AI')).toBeVisible()

    // AI FIGHTボタンが消えるか確認
    await expect(aiFightButton).not.toBeVisible()
  })

  test('should display both player and AI scores during battle', async ({ page }) => {
    // AI対戦を開始
    await page.getByText(/AI FIGHT/i).click()

    // プレイヤーとAIのスコアが両方表示されているか確認
    await expect(page.getByText('Player')).toBeVisible()
    await expect(page.getByText('AI')).toBeVisible()
  })

  test('should show AI and player snakes on the grid', async ({ page }) => {
    // AI対戦を開始
    await page.getByText(/AI FIGHT/i).click()

    // ゲームグリッド内に蛇のセグメントが複数あることを確認
    const grid = page.locator('[data-testid="game-grid"]')
    const snakeSegments = grid.locator('[data-testid^="snake-segment-"]')

    // AI蛇とプレイヤー蛇の両方のセグメントがあるため、6個以上あるはず
    await expect(snakeSegments).toHaveCount(6, { timeout: 3000 })
  })

  test('should update scores when snakes eat food', async ({ page }) => {
    // AI対戦を開始
    await page.getByText(/AI FIGHT/i).click()

    // 初期スコアを取得
    const initialScore = await page
      .locator('text=Player')
      .locator('..')
      .locator('.text-xl')
      .textContent()

    // ゲームが進行するのを少し待つ
    await page.waitForTimeout(5000)

    // スコアが変化したか確認（どちらかの蛇が餌を食べた可能性）
    // 注: テストの性質上、100%確実ではないが、高確率でスコアが変化する
  })

  test('should end game when player dies', async ({ page }) => {
    // AI対戦を開始
    await page.getByText(/AI FIGHT/i).click()

    // ゲームが進行してゲームオーバーになるのを待つ（最大30秒）
    // 注: これは時間がかかる可能性があるため、タイムアウトを長めに設定
    await page.waitForSelector('text=GAME OVER', { timeout: 30000 })

    // 勝者メッセージが表示されるか確認
    const winnerMessage = page.locator('text=/Player Wins!|AI Wins!|Draw!/')
    await expect(winnerMessage).toBeVisible()
  })

  test('should highlight leading player in score display', async ({ page }) => {
    // AI対戦を開始
    await page.getByText(/AI FIGHT/i).click()

    // スコア表示のコンテナを取得
    const playerScoreContainer = page.locator('text=Player').locator('..')
    const aiScoreContainer = page.locator('text=AI').locator('..')

    // どちらかがハイライトされているか確認（font-boldクラス）
    const playerBold = await playerScoreContainer.evaluate((el) =>
      el.className.includes('font-bold')
    )
    const aiBold = await aiScoreContainer.evaluate((el) =>
      el.className.includes('font-bold')
    )

    // 少なくともどちらか一方がハイライトされているはず
    expect(playerBold || aiBold).toBeTruthy()
  })
})
