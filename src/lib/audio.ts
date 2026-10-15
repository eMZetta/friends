// Shared Web Audio plumbing for effects, recorded voice lines and music.
//
// Audio files live in src/assets/audio/ and are found automatically at build time:
//   voice/<lang>/<key>.mp3   recorded voice lines (see docs/AUDIO.md)
//   sfx/<name>.mp3           sound effects that replace the synthesized ones
//   music/loop.mp3           optional background music
// Anything missing falls back to synthesized sound or the system voice.

import { useSettings } from '@/stores/settings'

const SOFT_VOLUME = 0.55

let ctx: AudioContext | null = null

export function audioContext(): AudioContext | null {
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

const PREFIX = '/src/assets/audio/'
const files = import.meta.glob('/src/assets/audio/**/*.{mp3,m4a,aac,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const index = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  index.set(path.slice(PREFIX.length).replace(/\.[^.]+$/, ''), url)
}

/** URL of an audio file by its name without extension, e.g. "sfx/pop". */
export function audioUrl(name: string): string | undefined {
  return index.get(name)
}

export function audioNames(prefix: string): string[] {
  return [...index.keys()].filter((name) => name.startsWith(prefix))
}

const pending = new Map<string, Promise<AudioBuffer>>()
const ready = new Map<string, AudioBuffer>()

export function loadBuffer(url: string): Promise<AudioBuffer> {
  const existing = pending.get(url)
  if (existing) return existing
  const ac = audioContext()
  if (!ac) return Promise.reject(new Error('Web Audio unavailable'))
  const promise = fetch(url)
    .then((res) => res.arrayBuffer())
    .then((data) => ac.decodeAudioData(data))
  promise.then(
    (buffer) => ready.set(url, buffer),
    () => pending.delete(url),
  )
  pending.set(url, promise)
  return promise
}

/** A buffer that has already been decoded, for effects that must play without delay. */
export function readyBuffer(url: string): AudioBuffer | undefined {
  return ready.get(url)
}

export interface Playing {
  source: AudioBufferSourceNode
  gain: GainNode
}

/** Faktor für alle Lautstärken: im sanften Modus leiser, damit nichts erschreckt. */
export function masterVolume(): number {
  return useSettings().soft ? SOFT_VOLUME : 1
}

export function playBuffer(buffer: AudioBuffer, { volume = 1, loop = false } = {}): Playing | null {
  const ac = audioContext()
  if (!ac) return null
  const source = ac.createBufferSource()
  const gain = ac.createGain()
  source.buffer = buffer
  source.loop = loop
  gain.gain.value = volume * masterVolume()
  source.connect(gain)
  gain.connect(ac.destination)
  source.start()
  return { source, gain }
}
