# スネークゲーム - 技術設計書

## 技術スタック選択

### フロントエンド
- **Next.js 14.2.x**: App Router、Server Components 活用
- **React 18.x**: Hooks ベースの実装
- **TypeScript**: 型安全性確保
- **Tailwind CSS v3**: ユーティリティファーストCSS
- **CSS Animations**: ネオンエフェクト、グローエフェクト

**選択理由**:
- Next.js 14 の App Router により、PWA 対応が容易
- CSS Animations で軽量かつ高速なアニメーション
- TypeScript でゲームロジックの型安全性を確保

### AI 統合
- **Primary**: Google Gemini API（gemini-1.5-flash）
- **Fallback**: OpenAI API（gpt-4o-mini）

**選択理由**:
- Gemini Flash は高速・低コスト
- プレイスタイル分析に最適

### ゲームエンジン
- **requestAnimationFrame**: 60fps ゲームループ
- **Canvas API**: ゲームフィールド描画（オプション）
- **React State**: ゲーム状態管理

### AI ロジック
- **A*アルゴリズム**: AI スネークの経路探索
- **衝突回避ロジック**: プレイヤーとの衝突を回避

### データ管理
- **IndexedDB**: ローカルデータ永続化（Dexie.js 使用）
- **Zustand**: グローバル状態管理（軽量・シンプル）

### PWA
- **Workbox**: Service Worker 管理（Next.js PWA プラグイン）
- **next-pwa**: Next.js 向け PWA 設定

---

## アーキテクチャ設計

### コンポーネント構成

```
app/
├── layout.tsx                    # ルートレイアウト
├── page.tsx                      # トップページ（モード選択）
├── play/
│   └── page.tsx                  # プレイ画面
├── results/
│   └── page.tsx                  # 結果・分析画面
├── history/
│   └── page.tsx                  # プレイ履歴
└── settings/
    └── page.tsx                  # 設定画面

components/
├── GameField.tsx                 # ゲームフィールド本体
├── Snake.tsx                     # 蛇の描画
├── Food.tsx                      # 餌の描画
├── GameStats.tsx                 # 統計表示
├── ModeSelector.tsx              # モード選択
├── DifficultySelector.tsx        # 難易度選択
├── AIControls.tsx                # AI機能コントロール
├── AnalysisReport.tsx            # プレイ分析レポート
├── TouchControls.tsx             # スマホ用タッチコントロール
└── ProgressChart.tsx             # 上達グラフ

lib/
├── game/
│   ├── gameLoop.ts               # ゲームループ
│   ├── collision.ts              # 衝突判定
│   ├── movement.ts               # 移動ロジック
│   └── scoring.ts                # スコア計算
├── ai/
│   ├── aiSnake.ts                # AI スネークロジック
│   ├── pathfinding.ts            # A*経路探索
│   └── analyzePlay.ts            # AIプレイ分析
├── db/
│   ├── schema.ts                 # IndexedDB スキーマ
│   └── operations.ts             # CRUD 操作
└── utils/
    ├── constants.ts              # 定数定義
    └── helpers.ts                # ヘルパー関数
```

---

## データモデル設計

### 1. GameState（ゲーム状態）
```typescript
interface GameState {
  mode: 'classic' | 'timeAttack' | 'endless'; // ゲームモード
  difficulty: 'easy' | 'medium' | 'hard';   // 難易度
  status: 'ready' | 'playing' | 'paused' | 'gameOver'; // ゲーム状態
  score: number;                             // 現在のスコア
  level: number;                             // 現在のレベル
  speed: number;                             // 現在の速度倍率
  timeLeft: number;                          // 残り時間（タイムアタック時、秒）
  grid: {
    width: number;                           // グリッド幅（20）
    height: number;                          // グリッド高さ（20）
  };
  snake: Snake;                              // プレイヤーの蛇
  aiSnake: Snake | null;                     // AIの蛇（対戦時のみ）
  foods: Food[];                             // 餌のリスト
}
```

### 2. Snake（蛇）
```typescript
interface Snake {
  id: 'player' | 'ai';                       // 蛇の識別子
  body: Position[];                          // 体の位置配列（頭が[0]）
  direction: Direction;                      // 現在の方向
  nextDirection: Direction;                  // 次の方向（入力バッファ）
  color: string;                             // 蛇の色
  score: number;                             // スコア（AI対戦時）
  alive: boolean;                            // 生存状態
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface Position {
  x: number;                                 // X座標（0-19）
  y: number;                                 // Y座標（0-19）
}
```

### 3. Food（餌）
```typescript
interface Food {
  id: string;                                // UUID
  position: Position;                        // 位置
  type: 'normal' | 'speedBoost' | 'scoreDouble' | 'shrink'; // 種類
  points: number;                            // ポイント
  effect?: FoodEffect;                       // 特殊効果
  expiresAt?: number;                        // 有効期限（特殊餌のみ）
}

interface FoodEffect {
  type: 'speed' | 'score' | 'shrink';
  duration: number;                          // 効果時間（秒）
  multiplier?: number;                       // 倍率（スコア2倍等）
}
```

### 4. GameSession（ゲームセッション）
```typescript
interface GameSession {
  id: string;                                // UUID
  timestamp: number;                         // 開始時刻（Unix time）
  mode: 'classic' | 'timeAttack' | 'endless';
  difficulty: 'easy' | 'medium' | 'hard';
  finalScore: number;                        // 最終スコア
  maxLevel: number;                          // 到達レベル
  playTime: number;                          // プレイ時間（秒）
  foodsEaten: number;                        // 食べた餌の数
  specialFoodsEaten: number;                 // 特殊餌の数
  aiOpponent: boolean;                       // AI対戦したか
  aiScore: number;                           // AIスコア（対戦時）
  result: 'win' | 'lose' | 'gameOver';       // 結果
  aiAdvice: string;                          // AIアドバイス
}
```

### 5. UserSettings（ユーザー設定）
```typescript
interface UserSettings {
  soundEnabled: boolean;                     // 効果音
  musicEnabled: boolean;                     // BGM
  darkMode: boolean;                         // ダークモード（常時ON）
  controlScheme: 'arrows' | 'wasd';          // キーボード操作方式
  touchSensitivity: number;                  // タッチ感度（1-10）
  aiProvider: 'gemini' | 'openai';           // AI プロバイダー
}
```

---

## ゲームループ設計

### ゲームループアルゴリズム

**要件**: 60fps 維持、入力レスポンス < 16ms

**実装方針**:
```typescript
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 100; // 100ms = 10fps（蛇の移動速度）

function gameLoop(currentTime: number) {
  requestAnimationFrame(gameLoop);

  const deltaTime = currentTime - lastUpdateTime;

  if (deltaTime >= UPDATE_INTERVAL / gameState.speed) {
    // ゲームロジック更新
    updateGame();
    lastUpdateTime = currentTime;
  }

  // 描画（60fps）
  render();
}

function updateGame() {
  // 1. 蛇の移動
  moveSnake(gameState.snake);
  if (gameState.aiSnake) {
    moveAISnake(gameState.aiSnake, gameState);
  }

  // 2. 衝突判定
  checkCollisions();

  // 3. 餌の判定
  checkFoodCollision();

  // 4. 特殊餌のタイムアウト
  updateFoods();

  // 5. スコア・レベル更新
  updateScoreAndLevel();
}
```

### 入力ハンドリング

**PC（キーボード）**:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };

    const direction = keyMap[e.key];
    if (direction && !isOppositeDirection(direction, snake.direction)) {
      snake.nextDirection = direction;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**スマホ（スワイプ）**:
```typescript
const handleSwipe = (startPos: Position, endPos: Position) => {
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    // 横方向スワイプ
    snake.nextDirection = dx > 0 ? 'right' : 'left';
  } else {
    // 縦方向スワイプ
    snake.nextDirection = dy > 0 ? 'down' : 'up';
  }
};
```

---

## AI スネークロジック設計

### A*経路探索アルゴリズム

**目的**: AI が最短経路で餌を目指す

**実装方針**:
```typescript
function findPath(start: Position, goal: Position, obstacles: Position[]): Position[] {
  const openSet = new PriorityQueue<Node>();
  const closedSet = new Set<string>();

  const startNode: Node = {
    position: start,
    g: 0, // 開始からのコスト
    h: manhattanDistance(start, goal), // ヒューリスティック
    f: 0 + manhattanDistance(start, goal),
    parent: null,
  };

  openSet.enqueue(startNode, startNode.f);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();

    if (current.position.x === goal.x && current.position.y === goal.y) {
      return reconstructPath(current);
    }

    closedSet.add(positionToString(current.position));

    // 隣接マスを展開（上下左右）
    const neighbors = getNeighbors(current.position);
    for (const neighbor of neighbors) {
      // 障害物・壁チェック
      if (isObstacle(neighbor, obstacles) || closedSet.has(positionToString(neighbor))) {
        continue;
      }

      const g = current.g + 1;
      const h = manhattanDistance(neighbor, goal);
      const f = g + h;

      openSet.enqueue({ position: neighbor, g, h, f, parent: current }, f);
    }
  }

  return []; // 経路なし
}

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
```

### 衝突回避ロジック

**実装方針**:
```typescript
function moveAISnake(aiSnake: Snake, gameState: GameState) {
  // 1. 最も近い餌を探す
  const targetFood = findNearestFood(aiSnake.body[0], gameState.foods);

  // 2. A*で経路探索
  const obstacles = [
    ...aiSnake.body,
    ...gameState.snake.body, // プレイヤーの蛇も障害物
  ];
  const path = findPath(aiSnake.body[0], targetFood.position, obstacles);

  // 3. 経路がない場合はランダム移動（自己回避優先）
  if (path.length === 0) {
    const safeMoves = getSafeMoves(aiSnake, obstacles);
    if (safeMoves.length > 0) {
      aiSnake.nextDirection = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }
  } else {
    // 4. 経路の次の一手を実行
    const nextPos = path[1]; // path[0]は現在位置
    aiSnake.nextDirection = getDirectionToPosition(aiSnake.body[0], nextPos);
  }
}
```

---

## AI API 統合設計

### プレイスタイル分析フロー

```
1. ゲーム完了後、セッションデータを収集
   ↓
2. 統計を計算
   - 平均生存時間
   - スコア効率（時間あたりのスコア）
   - 移動パターン分析
   - リスクテイク傾向
   ↓
3. AI API にプロンプト送信
   プロンプト例:
   「以下のスネークゲームのプレイを分析し、改善アドバイスを提供してください。
   - 最終スコア: 1,250点
   - 生存時間: 3分20秒
   - 特殊餌取得率: 40%
   - 壁際プレイ頻度: 高い」
   ↓
4. AI が分析レポートを生成
   ↓
5. 結果画面に表示
```

### API 実装（Server Actions）

**app/actions/ai.ts**
```typescript
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeSnakePlayStyle(
  session: GameSession
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const scoreEfficiency = session.finalScore / (session.playTime / 60); // 1分あたりのスコア

  const prompt = `
スネークゲームのプレイスタイルを分析し、具体的なアドバイスを提供してください。

【データ】
- 最終スコア: ${session.finalScore}点
- プレイ時間: ${Math.floor(session.playTime / 60)}分${session.playTime % 60}秒
- 到達レベル: Lv.${session.maxLevel}
- 食べた餌: ${session.foodsEaten}個
- 特殊餌取得: ${session.specialFoodsEaten}個
- スコア効率: ${scoreEfficiency.toFixed(1)}点/分

【指示】
- 200文字程度で簡潔に
- 具体的な改善ポイントを提案
- ポジティブなトーンで
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

## 衝突判定設計

### 衝突判定アルゴリズム

**実装方針**:
```typescript
function checkCollisions(gameState: GameState): void {
  const head = gameState.snake.body[0];

  // 1. 壁との衝突（エンドレスモードは除外）
  if (gameState.mode !== 'endless') {
    if (isOutOfBounds(head, gameState.grid)) {
      gameOver(gameState);
      return;
    }
  } else {
    // エンドレスモード: 反対側に出現
    wrapPosition(head, gameState.grid);
  }

  // 2. 自分の体との衝突
  if (isSelfCollision(gameState.snake)) {
    if (gameState.mode === 'endless') {
      // エンドレスモード: 体を3マス短くする
      shrinkSnake(gameState.snake, 3);
    } else {
      gameOver(gameState);
      return;
    }
  }

  // 3. AI の体との衝突（対戦時）
  if (gameState.aiSnake && isCollision(head, gameState.aiSnake.body)) {
    gameOver(gameState);
    return;
  }
}

function isOutOfBounds(pos: Position, grid: Grid): boolean {
  return pos.x < 0 || pos.x >= grid.width || pos.y < 0 || pos.y >= grid.height;
}

function isSelfCollision(snake: Snake): boolean {
  const head = snake.body[0];
  return snake.body.slice(1).some(segment =>
    segment.x === head.x && segment.y === head.y
  );
}
```

---

## IndexedDB スキーマ（Dexie.js）

**lib/db/schema.ts**
```typescript
import Dexie, { Table } from 'dexie';

export class SnakeGameDB extends Dexie {
  sessions!: Table<GameSession>;
  settings!: Table<UserSettings>;

  constructor() {
    super('SnakeGameDB');
    this.version(1).stores({
      sessions: 'id, timestamp, mode, difficulty, finalScore',
      settings: 'id',
    });
  }
}

export const db = new SnakeGameDB();
```

---

## PWA 実装設計

### Service Worker 戦略

**キャッシュ戦略**:
- **App Shell**: Cache First（HTML、CSS、JS）
- **ゲームアセット**: Cache First（画像、サウンド）
- **API レスポンス**: Network First → Cache Fallback

**next.config.js**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js config
});
```

**public/manifest.json**
```json
{
  "name": "スネークゲーム",
  "short_name": "Snake",
  "description": "AI搭載スネークゲーム",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#06b6d4",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## アニメーション設計

### ネオンエフェクト（CSS）

**components/GameField.tsx**
```css
.neon-text {
  color: #06b6d4;
  text-shadow:
    0 0 5px #06b6d4,
    0 0 10px #06b6d4,
    0 0 20px #06b6d4,
    0 0 40px #0891b2;
}

.neon-box {
  box-shadow:
    0 0 5px #06b6d4,
    0 0 10px #06b6d4,
    inset 0 0 5px #06b6d4;
}

.glow-food {
  animation: pulse-glow 1s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 5px #ef4444) drop-shadow(0 0 10px #ef4444);
  }
  50% {
    filter: drop-shadow(0 0 10px #ef4444) drop-shadow(0 0 20px #ef4444);
  }
}
```

---

## ファイル構成

```
app038-snake-game/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── play/
│   ├── results/
│   ├── history/
│   ├── settings/
│   └── actions/
│       └── ai.ts
├── components/
│   ├── GameField.tsx
│   ├── Snake.tsx
│   ├── Food.tsx
│   └── ...
├── lib/
│   ├── game/
│   ├── ai/
│   ├── db/
│   └── utils/
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── doc/
│   ├── requirements.md
│   ├── technical-design.md
│   └── implementation-plan.md
├── png/
│   └── ui-reference.png
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## セキュリティ・パフォーマンス考慮

### セキュリティ
- ✅ API キー環境変数管理（`.env.local`）
- ✅ HTTPS 必須（PWA 要件）
- ✅ XSS 対策（React デフォルト）

### パフォーマンス
- ✅ requestAnimationFrame で60fps維持
- ✅ A*アルゴリズムの最適化
- ✅ IndexedDB の非同期操作
- ✅ CSS Animations でGPU加速

---

## テスト戦略

### 単体テスト（Jest）
- `lib/game/collision.ts`: 衝突判定ロジック
- `lib/game/movement.ts`: 移動ロジック
- `lib/ai/pathfinding.ts`: A*経路探索

### 統合テスト（React Testing Library）
- `GameField.tsx`: ゲームループ・描画
- `GameStats.tsx`: 統計計算

### E2E テスト（Playwright）
- フルゲームフロー
- AI対戦動作確認
- オフライン動作確認

---

## 依存パッケージ

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@google/generative-ai": "^0.21.0",
    "dexie": "^4.0.0",
    "dexie-react-hooks": "^1.1.0",
    "zustand": "^4.5.0",
    "next-pwa": "^5.6.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "tailwindcss": "^3.4.0",
    "eslint": "^8",
    "eslint-config-next": "14.2.x",
    "@playwright/test": "^1.40.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## 実装優先順位

1. **Phase 0**: プロジェクトセットアップ、テスト環境構築
2. **Phase 1**: 基本ゲームループ・蛇の移動
3. **Phase 2**: 衝突判定・ゲームオーバー
4. **Phase 3**: 餌システム・スコア
5. **Phase 4**: レベル・速度システム
6. **Phase 5**: AI スネーク（A*経路探索）
7. **Phase 6**: AI 対戦モード
8. **Phase 7**: プレイ分析機能
9. **Phase 8**: PWA対応
10. **Phase 9**: 履歴・グラフ機能

---

## 完了条件
- ✅ 全機能が要件定義書を満たす
- ✅ TDD で全テストパス
- ✅ 60fps 維持
- ✅ PWA として完全動作（オフライン含む）
- ✅ Lighthouse スコア 90点以上
- ✅ AI 機能が正常動作
