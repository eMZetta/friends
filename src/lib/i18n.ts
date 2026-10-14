import { computed } from 'vue'

import { useSettings } from '@/stores/settings'
import type { ColorId } from './colors'

export type Lang = 'de' | 'en'

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'hexagon'
export type CountThing = 'apple' | 'star' | 'fish' | 'flower'
export type SongId = 'ducks' | 'star' | 'row'
export type AnimalKind = 'cat' | 'dog' | 'cow' | 'pig' | 'sheep' | 'duck' | 'frog' | 'lion'

export const ANIMALS: AnimalKind[] = ['cat', 'dog', 'cow', 'pig', 'sheep', 'duck', 'frog', 'lion']

// Name with definite article, as it is used in a sentence.
const animalNames: Record<Lang, Record<AnimalKind, string>> = {
  de: {
    cat: 'die Katze',
    dog: 'der Hund',
    cow: 'die Kuh',
    pig: 'das Schwein',
    sheep: 'das Schaf',
    duck: 'die Ente',
    frog: 'der Frosch',
    lion: 'der Löwe',
  },
  en: {
    cat: 'the cat',
    dog: 'the dog',
    cow: 'the cow',
    pig: 'the pig',
    sheep: 'the sheep',
    duck: 'the duck',
    frog: 'the frog',
    lion: 'the lion',
  },
}

const animalSounds: Record<Lang, Record<AnimalKind, string>> = {
  de: {
    cat: 'Miau',
    dog: 'Wau wau',
    cow: 'Muuuh',
    pig: 'Grunz grunz',
    sheep: 'Määäh',
    duck: 'Quak quak',
    frog: 'Quaaak',
    lion: 'Roaaar',
  },
  en: {
    cat: 'meow',
    dog: 'woof woof',
    cow: 'mooo',
    pig: 'oink oink',
    sheep: 'baaa',
    duck: 'quack quack',
    frog: 'ribbit',
    lion: 'roar',
  },
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const things: Record<Lang, Record<CountThing, string>> = {
  de: { apple: 'Äpfel', star: 'Sterne', fish: 'Fische', flower: 'Blumen' },
  en: { apple: 'apples', star: 'stars', fish: 'fish', flower: 'flowers' },
}

const colorNames: Record<Lang, Record<ColorId, string>> = {
  de: {
    red: 'rot',
    orange: 'orange',
    yellow: 'gelb',
    green: 'grün',
    blue: 'blau',
    purple: 'lila',
    pink: 'pink',
  },
  en: {
    red: 'red',
    orange: 'orange',
    yellow: 'yellow',
    green: 'green',
    blue: 'blue',
    purple: 'purple',
    pink: 'pink',
  },
}

// German adjectives are inflected: "die roten Ballone".
const deColorAdj: Record<ColorId, string> = {
  red: 'roten',
  orange: 'orangen',
  yellow: 'gelben',
  green: 'grünen',
  blue: 'blauen',
  purple: 'lila',
  pink: 'pinken',
}

const de = {
  games: {
    shapes: 'Formen',
    count: 'Zählen',
    balloons: 'Ballone',
    animals: 'Tiere',
    memory: 'Memory',
    patterns: 'Muster',
    music: 'Musik',
    shadows: 'Schatten',
    sizes: 'Groß & Klein',
    paint: 'Malen',
  },
  hello: 'Hallo! Ich bin Lumi. Was wollen wir spielen?',
  pause: { title: 'Lumi macht Pause', text: 'Für heute haben wir genug gespielt. Bis morgen!' },
  praise: ['Super!', 'Toll gemacht!', 'Prima!', 'Klasse!', 'Wunderbar!'],
  tryAgain: 'Versuch es nochmal!',
  shapesPrompt: 'Zieh jede Form in das passende Loch!',
  countPrompt: (thing: CountThing) => `Wie viele ${things.de[thing]} siehst du?`,
  balloonsPrompt: (color: ColorId) => `Lass die ${deColorAdj[color]} Ballone platzen!`,
  thatIs: (color: ColorId) => `Das ist ${colorNames.de[color]}.`,
  animalWhere: (a: AnimalKind) => `Wo ist ${animalNames.de[a]}?`,
  animalSays: (a: AnimalKind) => `${capitalize(animalNames.de[a])} macht ${animalSounds.de[a]}!`,
  animalIs: (a: AnimalKind) => `${animalSounds.de[a]}! Das ist ${animalNames.de[a]}.`,
  animalName: (a: AnimalKind) => `${capitalize(animalNames.de[a])}!`,
  memoryPrompt: 'Finde die Paare!',
  albumPrompt: 'Deine Sticker-Sammlung!',
  newSticker: 'Ein neuer Sticker!',
  thing: { apple: 'Apfel', star: 'Stern', fish: 'Fisch', flower: 'Blume' } as Record<CountThing, string>,
  balloon: 'Ballon',
  patternsPrompt: 'Was kommt als Nächstes?',
  musicPrompt: 'Mach Musik! Tippe auf die bunten Stäbe.',
  shadowsPrompt: 'Welches Tier ist der Schatten?',
  sizesPrompt: (big: boolean, count: number) =>
    `Tippe auf das ${big ? (count > 2 ? 'größte' : 'große') : count > 2 ? 'kleinste' : 'kleine'} Tier!`,
  paintPrompt: 'Male ein Bild! Tippe auf eine Farbe und male mit dem Finger.',
  songs: {
    ducks: 'Alle meine Entchen',
    star: 'Funkel, funkel, kleiner Stern',
    row: 'Hänschen klein',
  } as Record<SongId, string>,
  shapes: {
    circle: 'Kreis',
    square: 'Quadrat',
    triangle: 'Dreieck',
    star: 'Stern',
    heart: 'Herz',
    hexagon: 'Sechseck',
  } as Record<ShapeKind, string>,
  parents: {
    button: 'Für Eltern',
    gateTitle: 'Nur für Erwachsene',
    gateAsk: 'Bitte tippe diese Zahl ein:',
    settings: 'Einstellungen',
    language: 'Sprache',
    sound: 'Geräusche',
    voice: 'Sprachausgabe',
    music: 'Musik',
    on: 'An',
    off: 'Aus',
    close: 'Schließen',
    locked: 'Zu viele Versuche. Bitte kurz warten …',
    games: 'Spiele anzeigen',
    difficulty: 'Schwierigkeit',
    levels: { easy: 'Leicht', normal: 'Normal', hard: 'Schwer' },
    timeLimit: 'Tageslimit',
    unlimited: 'Aus',
    minutes: (n: number) => `${n} Min.`,
    played: (n: number) => `Heute gespielt: ${n} Min.`,
    resetToday: 'Zurücksetzen',
    about: 'Lumi ist kostenlos und werbefrei. Es werden keine Daten gesammelt.',
    tips: 'Tipp: Zum Verlassen eines Spiels das Haus-Symbol gedrückt halten. Mit „Geführter Zugriff“ (Einstellungen › Bedienungshilfen) bleibt dein Kind in der App.',
  },
}

type Messages = typeof de

const en: Messages = {
  games: {
    shapes: 'Shapes',
    count: 'Counting',
    balloons: 'Balloons',
    animals: 'Animals',
    memory: 'Memory',
    patterns: 'Patterns',
    music: 'Music',
    shadows: 'Shadows',
    sizes: 'Big & Small',
    paint: 'Paint',
  },
  hello: "Hi! I'm Lumi. What shall we play?",
  pause: { title: 'Lumi is taking a break', text: "We've played enough for today. See you tomorrow!" },
  praise: ['Great job!', 'Well done!', 'Awesome!', 'Yay!', 'Wonderful!'],
  tryAgain: 'Try again!',
  shapesPrompt: 'Drag each shape into the matching hole!',
  countPrompt: (thing) => `How many ${things.en[thing]} do you see?`,
  balloonsPrompt: (color) => `Pop the ${colorNames.en[color]} balloons!`,
  thatIs: (color) => `That is ${colorNames.en[color]}.`,
  animalWhere: (a) => `Where is ${animalNames.en[a]}?`,
  animalSays: (a) => `${capitalize(animalNames.en[a])} says ${animalSounds.en[a]}!`,
  animalIs: (a) => `${capitalize(animalSounds.en[a])}! That is ${animalNames.en[a]}.`,
  animalName: (a) => `${capitalize(animalNames.en[a])}!`,
  memoryPrompt: 'Find the pairs!',
  albumPrompt: 'Your sticker collection!',
  newSticker: 'A new sticker!',
  thing: { apple: 'apple', star: 'star', fish: 'fish', flower: 'flower' },
  balloon: 'balloon',
  patternsPrompt: 'What comes next?',
  musicPrompt: 'Make music! Tap the colorful bars.',
  shadowsPrompt: 'Which animal is the shadow?',
  sizesPrompt: (big, count) =>
    `Tap the ${big ? (count > 2 ? 'biggest' : 'big') : count > 2 ? 'smallest' : 'small'} animal!`,
  paintPrompt: 'Paint a picture! Tap a color and draw with your finger.',
  songs: {
    ducks: 'All My Little Ducklings',
    star: 'Twinkle, Twinkle, Little Star',
    row: 'Lightly Row',
  },
  shapes: {
    circle: 'circle',
    square: 'square',
    triangle: 'triangle',
    star: 'star',
    heart: 'heart',
    hexagon: 'hexagon',
  },
  parents: {
    button: 'For parents',
    gateTitle: 'Grown-ups only',
    gateAsk: 'Please enter this number:',
    settings: 'Settings',
    language: 'Language',
    sound: 'Sounds',
    voice: 'Voice',
    music: 'Music',
    on: 'On',
    off: 'Off',
    close: 'Close',
    locked: 'Too many tries. Please wait a moment …',
    games: 'Show games',
    difficulty: 'Difficulty',
    levels: { easy: 'Easy', normal: 'Normal', hard: 'Hard' },
    timeLimit: 'Daily limit',
    unlimited: 'Off',
    minutes: (n) => `${n} min`,
    played: (n) => `Played today: ${n} min`,
    resetToday: 'Reset',
    about: 'Lumi is free and ad-free. No data is collected.',
    tips: 'Tip: press and hold the house to leave a game. With Guided Access (Settings › Accessibility) your child stays inside the app.',
  },
}

export const messages: Record<Lang, Messages> = { de, en }

export function useT() {
  const settings = useSettings()
  return computed(() => messages[settings.lang])
}

/** Spelled-out numbers 21–99 for the parental gate; young children can't read them. */
export function numberToWords(n: number, lang: Lang): string {
  const tens = Math.floor(n / 10)
  const ones = n % 10
  if (lang === 'de') {
    const deOnes = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
    const deTens = ['', 'zehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']
    return ones === 0 ? `${deTens[tens]}` : `${deOnes[ones]}und${deTens[tens]}`
  }
  const enOnes = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const enTens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  return ones === 0 ? `${enTens[tens]}` : `${enTens[tens]}-${enOnes[ones]}`
}
