/**
 * カウントダウン表示コンポーネント
 */

'use client'

import { useEffect, useState } from 'react'

interface CountdownOverlayProps {
    onComplete: () => void
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
    const [count, setCount] = useState(3)

    useEffect(() => {
        if (count === 0) {
            // START表示後、少し待ってから完了
            const timer = setTimeout(() => {
                onComplete()
            }, 500)
            return () => clearTimeout(timer)
        }

        // カウントダウン
        const timer = setTimeout(() => {
            setCount(count - 1)
        }, 800) // 0.8秒ごと

        return () => clearTimeout(timer)
    }, [count, onComplete])

    return (
        <div
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(5px)',
            }}
        >
            <div
                className="text-8xl font-bold animate-pulse"
                style={{
                    color: count === 0 ? '#10b981' : '#06b6d4',
                    textShadow:
                        count === 0
                            ? '0 0 20px #10b981, 0 0 40px #10b981, 0 0 60px #10b981'
                            : '0 0 20px #06b6d4, 0 0 40px #06b6d4, 0 0 60px #06b6d4',
                    animation: 'countdown-pulse 0.8s ease-in-out',
                }}
            >
                {count === 0 ? 'START!' : count}
            </div>
        </div>
    )
}
