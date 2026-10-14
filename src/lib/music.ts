import { useSettings } from '@/stores/settings'
import { audioUrl, loadBuffer, playBuffer, type Playing } from './audio'

const MUSIC_VOLUME = 0.12
const url = audioUrl('music/loop')

/** Background music is optional: the setting only appears when a loop file is bundled. */
export const hasMusic = !!url

let playing: Playing | null = null
let starting = false

export async function startMusic() {
  if (!url || playing || starting || !useSettings().music) return
  starting = true
  try {
    const buffer = await loadBuffer(url)
    if (!playing && useSettings().music) playing = playBuffer(buffer, { volume: MUSIC_VOLUME, loop: true })
  } catch {
    // No music then; the app works fine without it.
  } finally {
    starting = false
  }
}

export function stopMusic() {
  try {
    playing?.source.stop()
  } catch {
    // Already stopped.
  }
  playing = null
}
