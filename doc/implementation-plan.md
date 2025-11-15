# スネークゲーム - 実装計画書（TDD準拠版）

## 実装方針
- **TDDサイクル**: 全Phaseで Red → Green → Refactor を厳守
- **テストファースト**: 実装前に必ずテストを書く
- **段階的実装**: Phase単位で完結させ、都度コミット
- **完了条件**: 全テストパス + コードカバレッジ80%以上 + 60fps維持

---

## Phase 0: プロジェクトセットアップ・テスト環境構築（予定工数: 2時間）

### 目的
開発環境とテスト基盤を整備し、TDD開発の土台を構築する。

### タスク

- [ ] **Next.js プロジェクト作成（Red）**
  - `npx create-next-app@14 . --typescript --tailwind --app --no-src-dir`
  - 初期設定確認テスト作成（ビルド成功確認）

- [ ] **テストライブラリセットアップ（Green）**
  - Jest + React Testing Library インストール
  - `jest.config.js` 設定
  - `setupTests.ts` 作成
  - 動作確認用ダミーテスト実装

- [ ] **E2Eテスト環境構築（Refactor）**
  - Playwright インストール・設定
  - `playwright.config.ts` 作成
  - サンプルE2Eテスト作成

- [ ] **追加ライブラリインストール**
  - Zustand（状態管理）
  - Dexie.js（IndexedDB）

- [ ] **PWA基盤セットアップ**
  - `next-pwa` インストール
  - `next.config.js` PWA設定
  - `manifest.json` 作成

- [ ] **環境変数設定**
  - `.env.local.example` 作成
  - API キー管理構造確認

### 完了条件
- ✅ `npm run dev` でサーバー起動
- ✅ `npm test` でテスト実行可能
- ✅ `npm run test:e2e` でE2Eテスト実行可能

---

## Phase 1: 基本ゲームループ・蛇の移動（予定工数: 8時間）

### 目的
ゲームループと蛇の基本移動機能を実装する。

### タスク

- [ ] **ゲームループロジックテスト作成（Red）**
  - `lib/game/gameLoop.test.ts` 作成
  - requestAnimationFrame のモックテスト
  - 60fps 維持テスト

- [ ] **ゲームループロジック実装（Green）**
  - `lib/game/gameLoop.ts` 実装
  - `requestAnimationFrame` による60fpsループ
  - UPDATE_INTERVAL 調整

- [ ] **移動ロジックテスト作成（Red）**
  - `lib/game/movement.test.ts` 作成
  - 方向転換テスト
  - 逆方向入力の無効化テスト

- [ ] **移動ロジック実装（Green）**
  - `lib/game/movement.ts` 実装
  - `moveSnake()` 関数実装
  - 方向転換ロジック実装

- [ ] **Snakeコンポーネントテスト作成（Red）**
  - `components/Snake.test.tsx` 作成
  - 蛇の描画テスト
  - グラデーション表示テスト

- [ ] **Snakeコンポーネント実装（Green）**
  - `components/Snake.tsx` 実装
  - 蛇の描画（SVGまたはCanvas）
  - グラデーションエフェクト

- [ ] **GameFieldコンポーネント実装（Red → Green → Refactor）**
  - `components/GameField.tsx` テスト・実装
  - グリッド表示
  - 蛇の描画統合

- [ ] **リファクタリング（Refactor）**
  - パフォーマンス最適化（useMemo、useCallback）
  - コード整理・命名改善

### 完了条件
- ✅ 蛇が正しく移動する
- ✅ 矢印キーで方向転換できる
- ✅ 60fps維持
- ✅ 全テストパス

---

## Phase 2: 衝突判定・ゲームオーバー（予定工数: 6時間）

### 目的
壁・自分の体との衝突判定とゲームオーバー処理を実装する。

### タスク

- [ ] **衝突判定ロジックテスト作成（Red）**
  - `lib/game/collision.test.ts` 作成
  - 壁との衝突テスト
  - 自分の体との衝突テスト
  - エンドレスモード: ワープテスト

- [ ] **衝突判定ロジック実装（Green）**
  - `lib/game/collision.ts` 実装
  - `isOutOfBounds()` 関数実装
  - `isSelfCollision()` 関数実装
  - `wrapPosition()` 関数実装（エンドレスモード用）

- [ ] **ゲームオーバー処理テスト作成（Red）**
  - ゲーム状態変更テスト
  - スコア記録テスト

- [ ] **ゲームオーバー処理実装（Green）**
  - `gameOver()` 関数実装
  - IndexedDB へのスコア保存

- [ ] **リファクタリング（Refactor）**
  - エラーハンドリング強化
  - テストケース追加

### 完了条件
- ✅ 壁にぶつかるとゲームオーバー
- ✅ 自分の体にぶつかるとゲームオーバー
- ✅ エンドレスモードでワープ動作
- ✅ 全テストパス

---

## Phase 3: 餌システム・スコア（予定工数: 6時間）

### 目的
餌の生成・取得・スコア計算機能を実装する。

### タスク

- [ ] **餌生成ロジックテスト作成（Red）**
  - `lib/game/food.test.ts` 作成
  - ランダム位置生成テスト
  - 蛇の体との重複回避テスト

- [ ] **餌生成ロジック実装（Green）**
  - `lib/game/food.ts` 実装
  - `generateFood()` 関数実装
  - 通常餌・特殊餌の生成

- [ ] **スコア計算ロジックテスト作成（Red）**
  - `lib/game/scoring.test.ts` 作成
  - スコア加算テスト
  - 特殊餌ボーナステスト

- [ ] **スコア計算ロジック実装（Green）**
  - `lib/game/scoring.ts` 実装
  - `addScore()` 関数実装
  - ボーナス計算

- [ ] **Foodコンポーネント実装（Red → Green → Refactor）**
  - `components/Food.tsx` テスト・実装
  - 通常餌の描画
  - 特殊餌の描画（発光エフェクト）

- [ ] **餌取得判定テスト・実装（Red → Green）**
  - `checkFoodCollision()` テスト・実装
  - 体が伸びるロジック
  - スコア加算

### 完了条件
- ✅ 餌が正しく生成される
- ✅ 餌を食べると体が伸びる
- ✅ スコアが正確に加算される
- ✅ 特殊餌が発光する
- ✅ 全テストパス

---

## Phase 4: レベル・速度システム（予定工数: 4時間）

### 目的
レベルアップと速度変更機能を実装する。

### タスク

- [ ] **レベルアップロジックテスト作成（Red）**
  - `lib/game/level.test.ts` 作成
  - スコア到達でレベルアップテスト
  - 速度上昇テスト

- [ ] **レベルアップロジック実装（Green）**
  - `lib/game/level.ts` 実装
  - `checkLevelUp()` 関数実装
  - 速度倍率計算

- [ ] **レベルアップ通知コンポーネント実装（Red → Green → Refactor）**
  - `components/LevelUpNotification.tsx` テスト・実装
  - 「LEVEL UP!」アニメーション
  - フェードイン・アウト

- [ ] **GameStatsコンポーネント実装（Red → Green → Refactor）**
  - `components/GameStats.tsx` テスト・実装
  - スコア、レベル、速度表示

### 完了条件
- ✅ スコア到達でレベルアップ
- ✅ 速度が正しく上昇
- ✅ レベルアップ通知が表示される
- ✅ 全テストパス

---

## Phase 5: AI スネーク（A*経路探索）（予定工数: 10時間）

### 目的
A*アルゴリズムによるAI スネークを実装する。

### タスク

- [ ] **A*経路探索テスト作成（Red）**
  - `lib/ai/pathfinding.test.ts` 作成
  - 最短経路計算テスト
  - 障害物回避テスト

- [ ] **A*経路探索実装（Green）**
  - `lib/ai/pathfinding.ts` 実装
  - `findPath()` 関数実装
  - Manhattan距離ヒューリスティック

- [ ] **AI スネークロジックテスト作成（Red）**
  - `lib/ai/aiSnake.test.ts` 作成
  - AI移動判定テスト
  - 衝突回避テスト

- [ ] **AI スネークロジック実装（Green）**
  - `lib/ai/aiSnake.ts` 実装
  - `moveAISnake()` 関数実装
  - 安全な移動選択ロジック

- [ ] **リファクタリング（Refactor）**
  - A*アルゴリズム最適化
  - パフォーマンステスト

### 完了条件
- ✅ AI が最短経路で餌を目指す
- ✅ AI が障害物を回避する
- ✅ AI が自然に動く
- ✅ 全テストパス

---

## Phase 6: AI 対戦モード（予定工数: 6時間）

### 目的
プレイヤーとAI スネークが同じフィールドで対戦する機能を実装する。

### タスク

- [ ] **AI対戦ロジックテスト作成（Red）**
  - `lib/game/aiBattle.test.ts` 作成
  - スコア比較テスト
  - 勝敗判定テスト

- [ ] **AI対戦ロジック実装（Green）**
  - `lib/game/aiBattle.ts` 実装
  - 2匹の蛇の管理
  - 餌の早取り処理

- [ ] **AIControlsコンポーネント実装（Red → Green → Refactor）**
  - `components/AIControls.tsx` テスト・実装
  - AI FIGHTボタン
  - スコア比較表示

- [ ] **対戦フロー統合テスト（E2E）**
  - Playwright E2Eテスト作成
  - 対戦開始→勝敗判定フロー確認

### 完了条件
- ✅ AI対戦モードが動作する
- ✅ スコア比較が正確
- ✅ 勝敗判定が正しい
- ✅ E2Eテストパス

---

## Phase 7: プレイ分析機能（予定工数: 5時間）

### 目的
AI によるプレイスタイル分析機能を実装する。

### タスク

- [ ] **プレイデータ収集ロジックテスト作成（Red）**
  - `lib/game/analytics.test.ts` 作成
  - データ収集テスト
  - 統計計算テスト

- [ ] **プレイデータ収集ロジック実装（Green）**
  - `lib/game/analytics.ts` 実装
  - 生存時間、スコア効率計算

- [ ] **AI分析Server Action実装（Red → Green）**
  - `app/actions/ai.ts` 実装
  - `analyzeSnakePlayStyle()` テスト・実装

- [ ] **AnalysisReportコンポーネント実装（Red → Green → Refactor）**
  - `components/AnalysisReport.tsx` テスト・実装
  - AIアドバイス表示

- [ ] **結果画面実装（E2E）**
  - `app/results/page.tsx` 実装
  - E2Eテスト作成

### 完了条件
- ✅ プレイデータが正確に収集される
- ✅ AI が適切なアドバイスを生成
- ✅ 結果画面が見やすく表示
- ✅ 全テストパス

---

## Phase 8: タッチ操作・レスポンシブ対応（予定工数: 4時間）

### 目的
スマホでのスワイプ操作とレスポンシブデザインを実装する。

### タスク

- [ ] **スワイプ検出ロジックテスト作成（Red）**
  - `lib/game/touch.test.ts` 作成
  - スワイプ方向判定テスト

- [ ] **スワイプ検出ロジック実装（Green）**
  - `lib/game/touch.ts` 実装
  - `handleSwipe()` 関数実装

- [ ] **TouchControlsコンポーネント実装（Red → Green → Refactor）**
  - `components/TouchControls.tsx` テスト・実装
  - スワイプエリア表示（スマホ時のみ）

- [ ] **レスポンシブデザイン調整**
  - スマホ画面でのレイアウト最適化
  - タッチ操作エリア確保

### 完了条件
- ✅ スワイプで方向転換できる
- ✅ スマホで快適にプレイ可能
- ✅ 全テストパス

---

## Phase 9: PWA対応（予定工数: 3時間）

### 目的
完全なオフライン動作とインストール機能を実装する。

### タスク

- [ ] **Service Worker動作テスト作成（Red）**
  - Service Worker登録テスト
  - オフライン動作テスト

- [ ] **Service Worker設定（Green）**
  - `next-pwa` 詳細設定
  - キャッシュルール定義

- [ ] **IndexedDB統合（Red → Green → Refactor）**
  - `lib/db/schema.ts` 実装
  - Dexie.js セットアップ
  - CRUD操作実装

- [ ] **インストールプロンプト実装**
  - PWAインストールボタン

- [ ] **E2Eテスト（Offline）**
  - Playwright オフラインモードテスト

### 完了条件
- ✅ オフラインで完全動作
- ✅ インストール可能
- ✅ Lighthouse PWA スコア 100点
- ✅ 全テストパス

---

## Phase 10: 履歴・グラフ機能（予定工数: 4時間）

### 目的
過去のプレイ履歴と上達グラフを表示する。

### タスク

- [ ] **履歴取得ロジックテスト作成（Red）**
  - IndexedDB クエリテスト

- [ ] **履歴取得ロジック実装（Green）**
  - `lib/db/operations.ts` 拡張

- [ ] **ProgressChartコンポーネント実装（Red → Green → Refactor）**
  - `components/ProgressChart.tsx` テスト・実装
  - Recharts でグラフ描画

- [ ] **履歴画面実装**
  - `app/history/page.tsx` 実装
  - E2Eテスト

### 完了条件
- ✅ 履歴が正確に保存・取得される
- ✅ グラフが見やすく表示
- ✅ 全テストパス

---

## Phase 11: 最終調整・パフォーマンス最適化（予定工数: 3時間）

### タスク

- [ ] **パフォーマンス計測**
  - Lighthouse テスト実行
  - 60fps 維持確認

- [ ] **最適化実施**
  - ゲームループ最適化
  - A*アルゴリズム最適化
  - バンドルサイズ削減

- [ ] **アクセシビリティ改善**
  - ARIA属性追加
  - キーボードナビゲーション

- [ ] **最終E2Eテスト**
  - 全機能フローテスト

- [ ] **ドキュメント整備**
  - README.md 作成

### 完了条件
- ✅ Lighthouse スコア全項目90点以上
- ✅ 60fps 維持
- ✅ 全E2Eテストパス
- ✅ コードカバレッジ80%以上

---

## 全体スケジュール

| Phase | 内容 | 工数 | 累計 |
|-------|------|------|------|
| Phase 0 | セットアップ・テスト環境 | 2h | 2h |
| Phase 1 | ゲームループ・蛇の移動 | 8h | 10h |
| Phase 2 | 衝突判定・ゲームオーバー | 6h | 16h |
| Phase 3 | 餌システム・スコア | 6h | 22h |
| Phase 4 | レベル・速度システム | 4h | 26h |
| Phase 5 | AI スネーク（A*） | 10h | 36h |
| Phase 6 | AI 対戦モード | 6h | 42h |
| Phase 7 | プレイ分析機能 | 5h | 47h |
| Phase 8 | タッチ操作・レスポンシブ | 4h | 51h |
| Phase 9 | PWA対応 | 3h | 54h |
| Phase 10 | 履歴・グラフ | 4h | 58h |
| Phase 11 | 最終調整 | 3h | **61h** |

**総工数**: 約61時間（7.6日）

---

## Git コミット規律

### コミットタイミング
- 各Phase完了時
- Red → Green → Refactor の各サイクル完了時
- 全テストパス確認後

### コミットメッセージ例
```
feat(phase1): implement game loop and snake movement (Green)

- Add requestAnimationFrame game loop
- Add snake movement logic
- All tests passing (coverage: 85%)
- 60fps maintained
```

---

## 最終完了条件チェックリスト

- [ ] 全機能が要件定義書を満たす
- [ ] 全単体テストパス（コードカバレッジ80%以上）
- [ ] 全E2Eテストパス
- [ ] 60fps 維持
- [ ] PWA として完全動作（オフライン含む）
- [ ] Lighthouse スコア 90点以上（全項目）
- [ ] AI スネークが自然に動く
- [ ] AI 対戦が楽しい
- [ ] プレイ分析が的確
- [ ] スマホでスワイプ操作可能
- [ ] README.md 完備
- [ ] `.env.local.example` 提供

---

## 備考
- 各Phaseは独立して完結させる
- 問題発生時は即座に対応、次Phaseに持ち越さない
- TDDサイクルを厳守し、テストなしコードは書かない
- 60fps 維持を最優先事項とする
