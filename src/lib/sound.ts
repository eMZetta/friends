import { useSettings } from '@/stores/settings'
import { audioContext, audioNames, audioUrl, loadBuffer, masterVolume, playBuffer, readyBuffer } from './audio'

// Effects play a recorded sample from src/assets/audio/sfx/ when one exists and
// are synthesized otherwise, so the app always has sound.

function audio(): AudioContext | null {
  return useSettings().sound ? audioContext() : null
}

/** iOS only allows audio after a user gesture; call this from the first touch. */
export function unlockAudio() {
  const ac = audioContext()
  if (!ac) return
  const src = ac.createBufferSource()
  src.buffer = ac.createBuffer(1, 1, 22050)
  src.connect(ac.destination)
  src.start(0)
  // Effects are short; decode them all now so they play without delay later.
  for (const name of audioNames('sfx/')) void loadBuffer(audioUrl(name)!).catch(() => {})
}

/** Plays a decoded sample if one exists; returns false to fall back to synthesis. */
function sample(name: string, volume = 1): boolean {
  if (!useSettings().sound) return true
  const url = audioUrl(`sfx/${name}`)
  const buffer = url && readyBuffer(url)
  if (!buffer) return false
  playBuffer(buffer, { volume })
  return true
}

interface ToneOptions {
  type?: OscillatorType
  volume?: number
  slideTo?: number
}

function tone(freq: number, start: number, duration: number, opts: ToneOptions = {}) {
  const ac = audio()
  if (!ac) return
  const { type = 'sine', slideTo } = opts
  const volume = (opts.volume ?? 0.25) * masterVolume()
  const t = ac.currentTime + start
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

export const sfx = {
  tap() {
    if (sample('tap')) return
    tone(660, 0, 0.08, { type: 'triangle', volume: 0.15 })
  },
  pop() {
    if (sample('pop')) return
    tone(900, 0, 0.12, { type: 'square', volume: 0.08, slideTo: 200 })
    tone(1400, 0, 0.06, { type: 'triangle', volume: 0.12 })
  },
  snap() {
    if (sample('snap')) return
    tone(523, 0, 0.1, { type: 'triangle' })
    tone(784, 0.07, 0.16, { type: 'triangle' })
  },
  wrong() {
    if (sample('wrong')) return
    tone(330, 0, 0.15, { volume: 0.18 })
    tone(262, 0.12, 0.22, { volume: 0.18 })
  },
  /**
   * Xylophone bar `index` (0 = C5 … 7 = C6). Uses sfx/xylo-<index> if recorded, otherwise
   * a ringing fundamental plus the short, bright overtones of a wooden bar.
   */
  note(index: number, freq: number) {
    if (sample(`xylo-${index}`)) return
    tone(freq, 0, 1.1, { volume: 0.35 })
    tone(freq * 2, 0, 0.35, { type: 'triangle', volume: 0.06 })
    tone(freq * 4, 0, 0.15, { volume: 0.08 })
  },
  success() {
    if (sample('success')) return
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3, { type: 'triangle', volume: 0.2 }))
  },
}
