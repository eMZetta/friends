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

/** The animal's name without its article: "Katze", "cat". */
function animalNoun(lang: Lang, a: AnimalKind) {
  return animalNames[lang][a].split(' ').pop()!
}

/** First letter of the animal's name, for the letters game. */
export function initialOf(a: AnimalKind, lang: Lang): string {
  return animalNoun(lang, a).charAt(0).toUpperCase()
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

// "Finde den Kreis!" – the German article changes with the noun.
const deShapeAccusative: Record<ShapeKind, string> = {
  circle: 'den Kreis',
  square: 'das Quadrat',
  triangle: 'das Dreieck',
  star: 'den Stern',
  heart: 'das Herz',
  hexagon: 'das Sechseck',
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
    letters: 'Buchstaben',
  },
  worlds: { think: 'Knobeln', numbers: 'Zahlen & ABC', animals: 'Tierfreunde', colors: 'Farben & Musik' },
  back: 'Zurück',
  hello: 'Hallo! Ich bin Galip. Was wollen wir spielen?',
  shy: 'Hoppla! Galip mag es ganz sanft.',
  friend: 'Galip hat dich richtig lieb!',
  // Galips Geschichte: Jedes Herz ist ein Kapitel, vom schüchternen Zögern bis zu besten Freunden.
  story: [
    'Galip ist schüchtern. Sei ganz sanft, dann traut er sich näher.',
    'Galip schaut dich neugierig an.',
    'Galip wedelt ein bisschen mit der Rute.',
    'Galip kommt zu dir und schnüffelt an deiner Hand.',
    'Galip hüpft vor Freude. Fast beste Freunde!',
    'Galip und du seid beste Freunde!',
  ],
  storyHeart: 'Galip hat dich ein Stück lieber!',
  bestFriends: 'Beste Freunde!',
  coffee: {
    title: 'Kaffeekasse',
    intro: 'Galip ist und bleibt gratis. Wenn du magst, kannst du freiwillig einen Kaffee spendieren – du bekommst dafür nichts freigeschaltet, es ändert sich nichts.',
    free: 'Rein freiwillig. Galip ist für alle gleich, ob mit oder ohne Spende.',
    onlyInApp: 'Spenden sind nur in der App aus dem App Store oder von Google Play möglich.',
    unavailable: 'Der Store ist gerade nicht erreichbar. Bitte später nochmals versuchen.',
    confirm: (price: string) => `${price} in die Kaffeekasse?`,
    holdHint: 'Zum Bestätigen gedrückt halten. Danach fragt dich noch dein Gerät.',
    hold: 'Gedrückt halten',
    waiting: 'Einen Moment …',
    change: 'Anderen Betrag wählen',
    thanks: 'Vielen herzlichen Dank! ☕ Das freut Galip und mich sehr.',
    cancelled: 'Abgebrochen – es wurde nichts abgebucht.',
    failed: 'Das hat leider nicht geklappt. Es wurde nichts abgebucht.',
    more: 'Mehr dazu und Impressum',
    back: 'Zurück',
  },
  about: {
    title: 'Über Galip & Impressum',
    imprint: 'Impressum',
    sections: [
      {
        heading: 'Warum es Galip gibt',
        paragraphs: [
          'Galip ist für meine Nichte entstanden. Sie wollte unbedingt am alten iPad der Grosseltern spielen – und die Kinderspiele in den App-Stores sind voller Werbung, Pro-Versionen und Abos, ein einziges grosses Geschäft. Das wollte ich nicht.',
          'Darum gibt es jetzt etwas Gescheites zum Spielen für die Kleinsten: kostenlos, ruhig und für alle Familien da. Und Galip, mein Hund, soll dabei ihr Freund werden.',
        ],
      },
      {
        heading: 'Gratis – und das bleibt so',
        paragraphs: [
          'Galip ist zu 100 % gratis. Keine Werbung, keine Abos, keine Pro-Version, nichts ist gesperrt. Alle Spiele stehen allen Kindern offen.',
        ],
      },
      {
        heading: 'Datenschutz',
        paragraphs: [
          'Es werden keine Daten gesammelt: keine Konten, kein Tracking, keine Statistik-Dienste, keine Werbe-Netzwerke. Galip läuft ohne Internet, und was die App sich merkt (Sprache, Sticker, Spielzeit), bleibt auf diesem Gerät.',
          'Auch bei einer Spende erfahre ich nicht, wer sie gemacht hat. Die Zahlung läuft allein über Apple bzw. Google; mich erreicht nur eine anonyme Abrechnung.',
        ],
      },
      {
        heading: 'Die Kaffeekasse',
        paragraphs: [
          'Wer möchte, kann mir als Erwachsener einen Kaffee spendieren (CHF 2, 5, 10 oder 20). Das hilft, die Entwicklerkonten bei Apple und Google zu bezahlen und Galip weiterzubauen. Apple und Google behalten dabei einen Teil des Betrags.',
          'Eine Spende ist ein Geschenk: Es gibt keine Gegenleistung, und sie ist nicht steuerlich absetzbar.',
        ],
      },
      {
        heading: 'Sicher vor Kinderfingern',
        paragraphs: [
          'Die Kaffeekasse ist mehrfach gesichert: Eltern-Gate, ein zweites Gate mit neuer Zahl, ein Knopf, den man gedrückt halten muss, und zuletzt die Bestätigung deines Geräts (z. B. Face ID oder Passwort).',
          'Zusätzlich kannst du in den Einstellungen deines Geräts Käufe sperren (Bildschirmzeit › Inhaltsbeschränkungen bzw. Familienfreigabe).',
        ],
      },
      {
        heading: 'Noch mehr für Kinder',
        paragraphs: ['Wer weitere Spiele für Kinder sucht: Auch «Lucas & Friends» ist einen Blick wert.'],
      },
    ],
  },
  hearts: 'Galips Herzen',
  pause: { title: 'Galip macht Pause', text: 'Für heute haben wir genug gespielt. Bis morgen!' },
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
  animalWho: (a: AnimalKind) => `Wer sagt ${animalSounds.de[a]}?`,
  memoryPrompt: 'Finde die Paare!',
  albumPrompt: 'Deine Sticker-Sammlung!',
  newSticker: 'Ein neuer Sticker!',
  thing: { apple: 'Apfel', star: 'Stern', fish: 'Fisch', flower: 'Blume' } as Record<CountThing, string>,
  balloon: 'Ballon',
  patternsPrompt: 'Was kommt als Nächstes?',
  musicPrompt: 'Mach Musik! Tippe auf die bunten Stäbe.',
  shadowsPrompt: 'Welches Tier ist der Schatten?',
  shadowsMatchPrompt: 'Welcher Schatten passt?',
  sizesOrderPrompt: 'Tippe die Tiere der Größe nach an: erst das kleinste!',
  sizesPrompt: (big: boolean, count: number) =>
    `Tippe auf das ${big ? (count > 2 ? 'größte' : 'große') : count > 2 ? 'kleinste' : 'kleine'} Tier!`,
  lettersPrompt: (a: AnimalKind) => `Mit welchem Buchstaben fängt ${animalNames.de[a]} an?`,
  lettersIs: (a: AnimalKind) => `${initialOf(a, 'de')} wie ${animalNoun('de', a)}!`,
  lettersFind: (letter: string) => `Welches Tier fängt mit ${letter} an?`,
  countGive: (n: number, thing: CountThing) => `Gib mir ${n} ${things.de[thing]}!`,
  shapesFind: (k: ShapeKind) => `Finde ${deShapeAccusative[k]}!`,
  shapesOdd: 'Welche Form ist anders?',
  balloonsOrder: 'Lass die Ballone der Reihe nach platzen: 1, 2, 3!',
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
    soft: 'Leise (hundefreundlich)',
    music: 'Musik',
    on: 'An',
    off: 'Aus',
    close: 'Schließen',
    locked: 'Zu viele Versuche. Bitte kurz warten …',
    games: 'Spiele anzeigen',
    difficulty: 'Altersgruppe',
    levels: { easy: '3–4 Jahre', normal: '4–5 Jahre', hard: '5–6 Jahre' },
    ageBadge: (age: string) => `Für ${age}`,
    timeLimit: 'Tageslimit',
    unlimited: 'Aus',
    minutes: (n: number) => `${n} Min.`,
    played: (n: number) => `Heute gespielt: ${n} Min.`,
    resetToday: 'Zurücksetzen',
    overview: 'Lernübersicht (seit dem Start)',
    rounds: (n: number) => (n === 1 ? '1 Runde' : `${n} Runden`),
    resetStats: 'Übersicht zurücksetzen',
    about: 'Galip ist kostenlos und werbefrei. Es werden keine Daten gesammelt.',
    tips: 'Tipp: Zum Verlassen eines Spiels das Haus-Symbol gedrückt halten. Mit „Geführter Zugriff“ (Einstellungen › Bedienungshilfen) bleibt dein Kind in der App.',
  },
}

type Messages = typeof de

const shapeNamesEn: Record<ShapeKind, string> = {
  circle: 'circle',
  square: 'square',
  triangle: 'triangle',
  star: 'star',
  heart: 'heart',
  hexagon: 'hexagon',
}

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
    letters: 'Letters',
  },
  worlds: { think: 'Puzzles', numbers: 'Numbers & ABC', animals: 'Animal friends', colors: 'Colors & Music' },
  back: 'Back',
  hello: "Hi! I'm Galip. What shall we play?",
  shy: 'Oops! Galip likes it nice and gentle.',
  friend: 'Galip really likes you!',
  story: [
    'Galip is shy. Be very gentle and he will come closer.',
    'Galip is looking at you with curiosity.',
    'Galip is wagging his tail a little.',
    'Galip comes over and sniffs your hand.',
    'Galip is hopping with joy. Almost best friends!',
    'Galip and you are best friends!',
  ],
  storyHeart: 'Galip likes you a little more!',
  bestFriends: 'Best friends!',
  coffee: {
    title: 'Coffee box',
    intro: 'Galip is and stays free. If you like, you can voluntarily buy me a coffee – nothing gets unlocked and nothing changes.',
    free: 'Entirely voluntary. Galip is the same for everyone, with or without a donation.',
    onlyInApp: 'Donations are only possible in the app from the App Store or Google Play.',
    unavailable: 'The store is not reachable right now. Please try again later.',
    confirm: (price: string) => `${price} into the coffee box?`,
    holdHint: 'Press and hold to confirm. Your device will ask once more afterwards.',
    hold: 'Press and hold',
    waiting: 'One moment …',
    change: 'Choose another amount',
    thanks: 'Thank you so much! ☕ Galip and I are very happy.',
    cancelled: 'Cancelled – nothing was charged.',
    failed: 'That did not work. Nothing was charged.',
    more: 'More about this, and imprint',
    back: 'Back',
  },
  about: {
    title: 'About Galip & imprint',
    imprint: 'Imprint',
    sections: [
      {
        heading: 'Why Galip exists',
        paragraphs: [
          "Galip was made for my niece. She wanted to play on her grandparents' old iPad – and the children's games in the app stores are full of ads, pro versions and subscriptions, one big business. I didn't want that.",
          'So now there is something decent for the little ones to play: free, calm and there for every family. And Galip, my dog, is meant to become her friend.',
        ],
      },
      {
        heading: 'Free – and it stays that way',
        paragraphs: [
          'Galip is 100% free. No ads, no subscriptions, no pro version, nothing is locked. All games are open to all children.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          "No data is collected: no accounts, no tracking, no analytics, no ad networks. Galip works without internet, and what the app remembers (language, stickers, play time) stays on this device.",
          "Even with a donation I don't learn who made it. The payment runs entirely through Apple or Google; I only receive an anonymous statement.",
        ],
      },
      {
        heading: 'The coffee box',
        paragraphs: [
          'Adults who wish to can buy me a coffee (CHF 2, 5, 10 or 20). It helps pay for the developer accounts at Apple and Google and to keep building Galip. Apple and Google keep a share of the amount.',
          'A donation is a gift: there is nothing in return, and it is not tax-deductible.',
        ],
      },
      {
        heading: 'Safe from little fingers',
        paragraphs: [
          "The coffee box is protected several times over: the parents' gate, a second gate with a new number, a button you have to hold, and finally your device's own confirmation (e.g. Face ID or password).",
          "You can also block purchases in your device's settings (Screen Time › Content restrictions, or Family Sharing).",
        ],
      },
      {
        heading: 'More for children',
        paragraphs: ['If you are looking for more games for children: “Lucas & Friends” is worth a look, too.'],
      },
    ],
  },
  hearts: "Galip's hearts",
  pause: { title: 'Galip is taking a break', text: "We've played enough for today. See you tomorrow!" },
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
  animalWho: (a) => `Who says ${animalSounds.en[a]}?`,
  memoryPrompt: 'Find the pairs!',
  albumPrompt: 'Your sticker collection!',
  newSticker: 'A new sticker!',
  thing: { apple: 'apple', star: 'star', fish: 'fish', flower: 'flower' },
  balloon: 'balloon',
  patternsPrompt: 'What comes next?',
  musicPrompt: 'Make music! Tap the colorful bars.',
  shadowsPrompt: 'Which animal is the shadow?',
  shadowsMatchPrompt: 'Which shadow fits?',
  sizesOrderPrompt: 'Tap the animals in order of size: the smallest first!',
  sizesPrompt: (big, count) =>
    `Tap the ${big ? (count > 2 ? 'biggest' : 'big') : count > 2 ? 'smallest' : 'small'} animal!`,
  lettersPrompt: (a) => `Which letter does ${animalNames.en[a]} start with?`,
  lettersIs: (a) => `${initialOf(a, 'en')} is for ${animalNoun('en', a)}!`,
  lettersFind: (letter) => `Which animal starts with ${letter}?`,
  countGive: (n, thing) => `Give me ${n} ${things.en[thing]}!`,
  shapesFind: (k) => `Find the ${shapeNamesEn[k]}!`,
  shapesOdd: 'Which shape is different?',
  balloonsOrder: 'Pop the balloons in order: 1, 2, 3!',
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
    soft: 'Quiet (dog-friendly)',
    music: 'Music',
    on: 'On',
    off: 'Off',
    close: 'Close',
    locked: 'Too many tries. Please wait a moment …',
    games: 'Show games',
    difficulty: 'Age group',
    levels: { easy: 'Ages 3–4', normal: 'Ages 4–5', hard: 'Ages 5–6' },
    ageBadge: (age: string) => age,
    timeLimit: 'Daily limit',
    unlimited: 'Off',
    minutes: (n) => `${n} min`,
    played: (n) => `Played today: ${n} min`,
    resetToday: 'Reset',
    overview: 'Learning overview (so far)',
    rounds: (n) => (n === 1 ? '1 round' : `${n} rounds`),
    resetStats: 'Reset overview',
    about: 'Galip is free and ad-free. No data is collected.',
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
