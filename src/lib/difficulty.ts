import { useSettings } from '@/stores/settings'

export type Difficulty = 'easy' | 'normal' | 'hard'

export const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']

/**
 * Maps the number of finished rounds to the level a game should play at.
 * Easy climbs half as fast, hard starts three levels in.
 */
export function levelFor(round: number, difficulty: Difficulty): number {
  if (difficulty === 'easy') return Math.floor(round / 2)
  if (difficulty === 'hard') return round + 3
  return round
}

/** Level for the current round, using the parents' difficulty setting. */
export function useLevel() {
  const settings = useSettings()
  return (round: number) => levelFor(round, settings.difficulty)
}
