/**
 * Foodコンポーネント
 * 餌を描画する
 */

import type { Food as FoodType } from '@/lib/types/game'

interface FoodProps {
  food: FoodType
  cellSize: number
}

export default function Food({ food, cellSize }: FoodProps) {
  const isSpecial = food.type !== 'normal'

  return (
    <div
      data-testid={`food-${food.id}`}
      className={`absolute rounded-full transition-all duration-200 ${
        isSpecial ? 'animate-pulse' : ''
      }`}
      style={{
        left: `${food.position.x * cellSize}px`,
        top: `${food.position.y * cellSize}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: isSpecial ? '#fbbf24' : '#ef4444',
        boxShadow: isSpecial
          ? `0 0 10px #fbbf24, 0 0 20px #fbbf24, 0 0 30px #fbbf24`
          : `0 0 5px #ef4444, 0 0 10px #ef4444`,
        zIndex: 5,
      }}
    >
      {/* 特殊餌の星型アイコン */}
      {isSpecial && (
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
          ★
        </div>
      )}
    </div>
  )
}
