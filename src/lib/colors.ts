export type ColorId = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export const COLORS: Record<ColorId, string> = {
  red: '#ff5a5f',
  orange: '#ff9f1c',
  yellow: '#ffd23f',
  green: '#3bceac',
  blue: '#3a86ff',
  purple: '#9b5de5',
  pink: '#f15bb5',
}

export const COLOR_IDS = Object.keys(COLORS) as ColorId[]
