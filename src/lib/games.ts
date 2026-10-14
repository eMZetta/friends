export const GAME_IDS = ['shapes', 'count', 'balloons', 'animals', 'memory', 'patterns', 'music', 'shadows', 'sizes', 'paint', 'letters'] as const

export type GameId = (typeof GAME_IDS)[number]

/** Daily play-time limits offered to parents, in minutes; 0 means no limit. */
export const LIMIT_OPTIONS = [0, 15, 30, 45, 60] as const
