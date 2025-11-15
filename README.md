# スネークゲーム

餌を食べて体が伸びる定番アクションゲーム。AI対戦機能とプレイスタイル分析を搭載した次世代スネークゲーム。

## 主要機能

- **マルチデバイス対応**: PC（矢印キー）、スマホ（スワイプ）両対応
- **餌システム**: 通常の餌＋特殊餌（スピードアップ、スコア2倍、体縮小）
- **難易度設定**: 初級・中級・上級（速度が変化）
- **3つのゲームモード**: クラシック、タイムアタック、エンドレス
- **AI対戦機能**: A*アルゴリズムを使ったAI蛇との対戦
- **プレイスタイル分析**: Google Gemini API / OpenAI APIによる上達アドバイス
- **ネオンビジュアル**: グロー効果による美しいビジュアル
- **PWA対応**: オフラインでも利用可能

## 技術スタック

- Next.js 14.x / React 18.x
- TypeScript
- Tailwind CSS v3
- Google Gemini API (Primary) / OpenAI API (Fallback)
- IndexedDB (Dexie.js)
- PWA (next-pwa)
- A*アルゴリズム（AI蛇の経路探索）
- requestAnimationFrame（60fps ゲームループ）

## ドキュメント

詳細な仕様は以下を参照してください：
- [要件定義書](doc/requirements.md)
- [技術設計書](doc/technical-design.md)
- [実装計画書](doc/implementation-plan.md)

## ターゲットユーザー

- カジュアルゲームプレイヤー
- レトロゲームファン
- 暇つぶしに軽く遊びたい人
- AI対戦で競い合いたい人
