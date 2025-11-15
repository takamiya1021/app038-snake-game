/**
 * 履歴機能のE2Eテスト
 */

import { test, expect } from '@playwright/test'

test.describe('History Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to history page from home', async ({ page }) => {
    // 履歴ボタンをクリック
    await page.click('text=プレイ履歴')

    // 履歴ページに遷移したことを確認
    await expect(page).toHaveURL('/history')
    await expect(page.locator('h1')).toContainText('プレイ履歴')
  })

  test('should display empty state when no history', async ({ page }) => {
    // IndexedDBをクリア
    await page.goto('/history')
    await page.evaluate(() => {
      return indexedDB.deleteDatabase('SnakeGameDB')
    })

    // ページをリロード
    await page.reload()

    // 空の状態を確認
    await expect(
      page.locator('text=まだゲームをプレイしていません')
    ).toBeVisible()
  })

  test('should navigate back to game', async ({ page }) => {
    await page.goto('/history')

    // ゲームに戻るボタンをクリック
    await page.click('text=ゲームに戻る')

    // ホームページに戻ったことを確認
    await expect(page).toHaveURL('/')
  })

  test('should display history after playing a game', async ({ page }) => {
    // ゲームをプレイ
    await page.click('text=プレイする')
    await expect(page).toHaveURL('/play')

    // ゲームが開始されるまで待機
    await expect(page.locator('text=ゲーム進行中')).toBeVisible()

    // ゲームオーバーになるまで待機（壁に衝突）
    // 左に何度か移動させて壁にぶつかる
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft')
      await page.waitForTimeout(100)
    }

    // ゲームオーバーを確認
    await expect(page.locator('text=GAME OVER')).toBeVisible({
      timeout: 10000,
    })

    // 履歴ページに移動
    await page.goto('/history')

    // 履歴が表示されることを確認
    await expect(page.locator('[data-testid="history-score"]')).toBeVisible({
      timeout: 5000,
    })

    // 統計情報が表示されることを確認
    await expect(page.locator('text=総プレイ回数')).toBeVisible()
    await expect(page.locator('text=最高スコア')).toBeVisible()
  })

  test('should display score graph when history exists', async ({ page }) => {
    // 既に履歴がある状態で履歴ページにアクセス
    await page.goto('/history')

    // ゲームをプレイしてから確認する
    // まずゲームをプレイ
    await page.goto('/play')
    await expect(page.locator('text=ゲーム進行中')).toBeVisible()

    // 少し待ってからゲームオーバー
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(2000)

    await page.goto('/history')

    // グラフが表示されることを確認
    await expect(page.locator('[data-testid="score-graph"]')).toBeVisible({
      timeout: 5000,
    })
    await expect(page.locator('text=スコア推移')).toBeVisible()
  })
})

test.describe('History Integration', () => {
  test('should save game data to IndexedDB on game over', async ({ page }) => {
    await page.goto('/play')

    // ゲーム開始を待機
    await expect(page.locator('text=ゲーム進行中')).toBeVisible()

    // ゲームオーバーにする
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft')
      await page.waitForTimeout(100)
    }

    await expect(page.locator('text=GAME OVER')).toBeVisible({
      timeout: 10000,
    })

    // IndexedDBにデータが保存されたか確認
    const historyCount = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('SnakeGameDB', 1)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      const transaction = db.transaction(['gameHistory'], 'readonly')
      const store = transaction.objectStore('gameHistory')
      const countRequest = store.count()

      return new Promise<number>((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result)
        countRequest.onerror = () => reject(countRequest.error)
      })
    })

    // 少なくとも1つの履歴が保存されているはず
    expect(historyCount).toBeGreaterThan(0)
  })
})
