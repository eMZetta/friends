import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { levelFor } from '@/lib/difficulty'
import { messages, numberToWords } from '@/lib/i18n'
import { shuffle } from '@/lib/random'
import { voiceKey } from '@/lib/speech'
import { STICKERS } from '@/lib/stickers'
import { useStickers } from '@/stores/stickers'

describe('numberToWords', () => {
  it('spells German numbers', () => {
    expect(numberToWords(24, 'de')).toBe('vierundzwanzig')
    expect(numberToWords(31, 'de')).toBe('einunddreißig')
  })

  it('spells English numbers', () => {
    expect(numberToWords(24, 'en')).toBe('twenty-four')
    expect(numberToWords(99, 'en')).toBe('ninety-nine')
  })
})

describe('levelFor', () => {
  it('climbs slower on easy and starts higher on hard', () => {
    expect(levelFor(4, 'easy')).toBe(2)
    expect(levelFor(4, 'normal')).toBe(4)
    expect(levelFor(0, 'hard')).toBe(3)
  })
})

describe('shuffle', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('keeps all items', () => {
    const items = [1, 2, 3, 4, 5]
    expect(shuffle(items).sort()).toEqual(items)
  })
})

describe('animal phrases', () => {
  it('uses the right German article and sound', () => {
    expect(messages.de.animalWhere('pig')).toBe('Wo ist das Schwein?')
    expect(messages.de.animalSays('cow')).toBe('Die Kuh macht Muuuh!')
  })

  it('builds English sentences', () => {
    expect(messages.en.animalSays('dog')).toBe('The dog says woof woof!')
    expect(messages.en.animalIs('duck')).toBe('Quack quack! That is the duck.')
  })
})

describe('voiceKey', () => {
  it('turns sentences into stable file names', () => {
    expect(voiceKey('Wo ist die Kuh?')).toBe('wo-ist-die-kuh')
    expect(voiceKey('Zieh jede Form in das passende Loch!')).toBe('zieh-jede-form-in-das-passende-loch')
    expect(voiceKey('Lass die grünen Ballone platzen!')).toBe('lass-die-gruenen-ballone-platzen')
    expect(voiceKey("Hi! I'm Lumi.")).toBe('hi-i-m-lumi')
  })
})

describe('stickers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('awards each sticker once until the album is full', () => {
    const store = useStickers()
    const ids = new Set<string>()
    for (let i = 0; i < STICKERS.length; i++) ids.add(store.award()!.id)
    expect(ids.size).toBe(STICKERS.length)
    expect(store.award()).toBeNull()
  })

  it('keeps the collection across app starts', () => {
    useStickers().award()
    setActivePinia(createPinia())
    expect(useStickers().collected).toHaveLength(1)
  })
})
