/**
 * プレイ画面
 */

import GameField from '@/components/GameField'

export default function PlayPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1
        className="text-4xl font-bold mb-8 text-cyan-400"
        style={{
          textShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4, 0 0 20px #06b6d4',
        }}
      >
        SNAKE GAME
      </h1>

      <GameField />

      <div className="mt-8 text-center">
        <a
          href="/"
          className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
        >
          ← メニューに戻る
        </a>
      </div>
    </main>
  )
}
