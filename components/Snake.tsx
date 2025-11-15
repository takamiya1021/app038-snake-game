/**
 * Snakeコンポーネント
 * 蛇を描画する
 */

import type { Snake as SnakeType } from '@/lib/types/game'

interface SnakeProps {
  snake: SnakeType
  cellSize: number
}

export default function Snake({ snake, cellSize }: SnakeProps) {
  return (
    <>
      {snake.body.map((segment, index) => {
        const isHead = index === 0
        // グラデーション効果: 頭から尻尾に向かって徐々に暗くなる
        const opacity = 1 - (index / snake.body.length) * 0.3

        return (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            data-testid={`snake-segment-${index}`}
            className={`absolute rounded transition-all duration-100 ${
              isHead ? 'snake-head' : ''
            }`}
            style={{
              left: `${segment.x * cellSize}px`,
              top: `${segment.y * cellSize}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundColor: snake.color,
              opacity,
              boxShadow: isHead
                ? `0 0 10px ${snake.color}, 0 0 20px ${snake.color}`
                : `0 0 5px ${snake.color}`,
              zIndex: isHead ? 20 : 10,
            }}
          />
        )
      })}
    </>
  )
}
