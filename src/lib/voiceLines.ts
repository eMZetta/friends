import { COLOR_IDS } from './colors'
import { ANIMALS, initialOf, messages, type CountThing, type Lang, type ShapeKind, type SongId } from './i18n'
import { voiceKey } from './speech'
import { STICKERS, stickerName } from './stickers'

const THINGS: CountThing[] = ['apple', 'star', 'fish', 'flower']

/** Every sentence the app can speak in one language, for recording voice lines. */
export function voiceLines(lang: Lang): { key: string; text: string }[] {
  const m = messages[lang]
  const texts = [
    m.hello,
    m.shy,
    m.friend,
    ...Object.values(m.games),
    ...m.praise,
    m.newSticker,
    m.tryAgain,
    m.shapesPrompt,
    ...Object.values(m.shapes as Record<ShapeKind, string>),
    ...THINGS.map((thing) => m.countPrompt(thing)),
    ...Array.from({ length: 10 }, (_, i) => String(i + 1)),
    ...COLOR_IDS.map((c) => m.balloonsPrompt(c)),
    ...COLOR_IDS.map((c) => m.thatIs(c)),
    ...ANIMALS.flatMap((a) => [m.animalWhere(a), m.animalSays(a), m.animalIs(a), m.animalName(a)]),
    m.memoryPrompt,
    m.patternsPrompt,
    m.musicPrompt,
    m.shadowsPrompt,
    m.sizesPrompt(true, 2),
    m.sizesPrompt(false, 2),
    m.sizesPrompt(true, 3),
    m.sizesPrompt(false, 3),
    m.paintPrompt,
    ...ANIMALS.flatMap((a) => [m.lettersPrompt(a), m.lettersIs(a)]),
    ...ANIMALS.map((a) => initialOf(a, lang)),
    ...Object.values(m.songs as Record<SongId, string>),
    m.albumPrompt,
    ...STICKERS.map((s) => stickerName(s, lang)),
  ]

  const seen = new Set<string>()
  const lines: { key: string; text: string }[] = []
  for (const text of texts) {
    const key = voiceKey(text)
    if (seen.has(key)) continue
    seen.add(key)
    lines.push({ key, text })
  }
  return lines
}
