import type { ColorId } from './colors'
import { ANIMALS, messages, type AnimalKind, type CountThing, type Lang, type ShapeKind } from './i18n'

export type Sticker =
  | { id: string; type: 'animal'; kind: AnimalKind }
  | { id: string; type: 'shape'; kind: ShapeKind; color: ColorId }
  | { id: string; type: 'thing'; kind: CountThing }
  | { id: string; type: 'balloon'; color: ColorId }
  | { id: string; type: 'lumi' }

const SHAPES: [ShapeKind, ColorId][] = [
  ['heart', 'red'],
  ['star', 'yellow'],
  ['circle', 'blue'],
  ['triangle', 'green'],
  ['square', 'purple'],
  ['hexagon', 'orange'],
]

const THINGS: CountThing[] = ['apple', 'fish', 'flower', 'star']

export const STICKERS: Sticker[] = [
  { id: 'lumi', type: 'lumi' },
  ...ANIMALS.map((kind): Sticker => ({ id: `animal-${kind}`, type: 'animal', kind })),
  ...SHAPES.map(([kind, color]): Sticker => ({ id: `shape-${kind}`, type: 'shape', kind, color })),
  ...THINGS.map((kind): Sticker => ({ id: `thing-${kind}`, type: 'thing', kind })),
  { id: 'balloon', type: 'balloon', color: 'pink' },
]

export function stickerName(sticker: Sticker, lang: Lang): string {
  const m = messages[lang]
  switch (sticker.type) {
    case 'animal':
      return m.animalName(sticker.kind)
    case 'shape':
      return m.shapes[sticker.kind]
    case 'thing':
      return m.thing[sticker.kind]
    case 'balloon':
      return m.balloon
    case 'lumi':
      return 'Galip!'
  }
}
