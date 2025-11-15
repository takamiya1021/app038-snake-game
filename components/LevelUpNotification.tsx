'use client'

/**
 * LevelUpNotificationコンポーネント
 * レベルアップ時の通知を表示
 */

import { useEffect, useState } from 'react'

interface LevelUpNotificationProps {
  show: boolean
  level: number
  onComplete?: () => void
}

export default function LevelUpNotification({
  show,
  level,
  onComplete,
}: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)

      // 2秒後にフェードアウト
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onComplete) {
          setTimeout(onComplete, 300) // アニメーション完了後にコールバック
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show && !isVisible) return null

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center pointer-events-none z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      data-testid="level-up-notification"
    >
      <div
        className={`text-6xl font-bold text-cyan-400 transition-all duration-500 ${
          isVisible ? 'scale-100' : 'scale-150'
        }`}
        style={{
          textShadow:
            '0 0 10px #06b6d4, 0 0 20px #06b6d4, 0 0 40px #06b6d4, 0 0 80px #0891b2',
        }}
      >
        LEVEL {level}!
      </div>
    </div>
  )
}
