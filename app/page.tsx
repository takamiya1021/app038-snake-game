import ModeSelector from '@/components/ModeSelector'

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

      <ModeSelector />
    </main>
  );
}

