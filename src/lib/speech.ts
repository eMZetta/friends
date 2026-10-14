import { useSettings } from '@/stores/settings'
import { audioUrl, loadBuffer, playBuffer, type Playing } from './audio'

const LOCALES = { de: 'de-DE', en: 'en-US' } as const

/**
 * File name for a voice line: "Wo ist die Kuh?" → "wo-ist-die-kuh".
 * Recordings go to src/assets/audio/voice/<lang>/<key>.mp3 (see docs/AUDIO.md).
 */
export function voiceKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
}

let current: Playing | null = null
let generation = 0

function stopVoice() {
  generation++
  try {
    current?.source.stop()
  } catch {
    // Already finished.
  }
  current = null
  synth()?.cancel()
}

function speakWithSystemVoice(parts: string[]) {
  const s = synth()
  if (!s) return
  const locale = LOCALES[useSettings().lang]
  const voice = s.getVoices().find((v) => v.lang.replace('_', '-').startsWith(locale))
  for (const text of parts) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = locale
    if (voice) utterance.voice = voice
    utterance.rate = 0.9
    utterance.pitch = 1.15
    s.speak(utterance)
  }
}

async function playRecorded(urls: string[], gen: number) {
  for (const url of urls) {
    const buffer = await loadBuffer(url)
    if (gen !== generation) return
    const playing = playBuffer(buffer)
    if (!playing) return
    current = playing
    await new Promise<void>((resolve) => (playing.source.onended = () => resolve()))
    if (gen !== generation) return
  }
}

/**
 * Speaks one or more sentences in a row. Uses recorded voice lines when every part has one,
 * so a sentence never switches voice halfway; otherwise the system voice reads everything.
 */
export function say(...parts: string[]) {
  const settings = useSettings()
  if (!settings.voice) return
  stopVoice()
  const gen = generation
  const urls = parts.map((text) => audioUrl(`voice/${settings.lang}/${voiceKey(text)}`))
  if (urls.every((url): url is string => !!url)) {
    playRecorded(urls, gen).catch(() => {
      if (gen === generation) speakWithSystemVoice(parts)
    })
  } else {
    speakWithSystemVoice(parts)
  }
}

/** iOS needs the first utterance to happen inside a user gesture. */
export function unlockSpeech() {
  synth()?.speak(new SpeechSynthesisUtterance(''))
}
