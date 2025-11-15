export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold mb-8 text-cyan-400" style={{
        textShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4, 0 0 20px #06b6d4'
      }}>
        SNAKE GAME
      </h1>
      <p className="text-xl text-gray-400 mb-12">
        AI搭載スネークゲーム
      </p>

      <div className="flex flex-col gap-4">
        <a
          href="/play"
          className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors shadow-lg"
          style={{
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
          }}
        >
          プレイする
        </a>
        <a
          href="/history"
          className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
        >
          プレイ履歴
        </a>
      </div>
    </main>
  );
}
