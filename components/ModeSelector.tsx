'use client'

/**
 * モード選択コンポーネント
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ModeSelector() {
    const router = useRouter()
    const [aiBattle, setAiBattle] = useState(false)

    const handlePlay = () => {
        // AI対戦モードの状態をURLパラメータで渡す
        const params = new URLSearchParams()
        if (aiBattle) {
            params.set('ai', 'true')
        }
        router.push(`/play?${params.toString()}`)
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-md">
            {/* AI対戦トグル */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white mb-1">AI対戦モード</span>
                        <span className="text-sm text-gray-400">
                            AIスネークと対戦します
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={aiBattle}
                            onChange={(e) => setAiBattle(e.target.checked)}
                            className="sr-only"
                        />
                        <div
                            className={`w-14 h-7 rounded-full transition-colors ${aiBattle ? 'bg-cyan-500' : 'bg-gray-600'
                                }`}
                            style={{
                                boxShadow: aiBattle
                                    ? '0 0 10px rgba(6, 182, 212, 0.5)'
                                    : 'none',
                            }}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full transition-transform ${aiBattle ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                            />
                        </div>
                    </div>
                </label>

                {aiBattle && (
                    <div className="mt-4 p-3 bg-cyan-900/30 rounded border border-cyan-700">
                        <p className="text-sm text-cyan-300">
                            🤖 AIスネーク（赤）と同時にスタートします
                        </p>
                    </div>
                )}
            </div>

            {/* プレイボタン */}
            <button
                onClick={handlePlay}
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xl rounded-lg transition-all shadow-lg hover:scale-105"
                style={{
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
                }}
            >
                {aiBattle ? '🤖 AI対戦スタート' : 'プレイする'}
            </button>

            {/* プレイ履歴ボタン */}
            <a
                href="/history"
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold text-center rounded-lg transition-colors"
            >
                プレイ履歴
            </a>
        </div>
    )
}
