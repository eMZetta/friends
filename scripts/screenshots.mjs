// Renders App Store screenshots for every language and device:
//   iPad 13"      landscape 2752×2064
//   iPhone 6.9"   portrait  1320×2868
// Builds the app, plays each game to a nice moment in headless Chromium and adds a caption.
//
//   yarn screenshots [ipad|iphone]        → store/screenshots/<device>/<lang>/NN-<name>.png
//   PW_CHANNEL=chrome yarn screenshots    (uses the installed Chrome instead of Playwright's Chromium)

import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { chromium } from 'playwright'
import sharp from 'sharp'
import { build, preview } from 'vite'

const OUT = 'store/screenshots'

const DEVICES = {
  // Viewport in points × scale = store pixels (13" iPad: 1376×1032 @2x, iPhone 6.9": 440×956 @3x).
  ipad: { W: 2752, H: 2064, viewport: { width: 1376, height: 1032 }, scale: 2, shotH: 1640, shotY: 360, capY: 250, font: 128, maxChars: 44 },
  iphone: { W: 1320, H: 2868, viewport: { width: 440, height: 956 }, scale: 3, shotH: 2160, shotY: 560, capY: 230, font: 96, maxChars: 22 },
}

const CAPTIONS = {
  de: {
    home: '11 Lernspiele – gratis & ohne Werbung',
    shapes: 'Formen erkennen und zuordnen',
    count: 'Spielerisch zählen lernen',
    animals: 'Tiere finden und hören',
    balloons: 'Farben entdecken',
    music: 'Xylophon & Kinderlieder',
    memory: 'Memory mit Tieren',
    album: 'Sticker sammeln als Belohnung',
  },
  en: {
    home: '11 learning games – free & ad-free',
    shapes: 'Recognize and match shapes',
    count: 'Learn to count through play',
    animals: 'Find animals, hear their sounds',
    balloons: 'Discover colors',
    music: 'Xylophone & nursery songs',
    memory: 'Animal memory',
    album: 'Collect stickers as rewards',
  },
}

const BACKGROUNDS = {
  home: ['#5bc0eb', '#9be3ff'],
  shapes: ['#ff8fab', '#ffc8a2'],
  count: ['#ffc94d', '#9be39b'],
  animals: ['#5bc0eb', '#8fdc7a'],
  balloons: ['#3a86ff', '#8fd6ff'],
  music: ['#ff9f1c', '#ff8fab'],
  memory: ['#9b5de5', '#f6a6d6'],
  album: ['#ff9f1c', '#ffd23f'],
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function center(page, selector) {
  const box = await page.locator(selector).first().boundingBox()
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/** Each scene opens a screen and plays it to a moment worth showing. */
const SCENES = [
  ['home', '#/', async () => {}],
  [
    'shapes',
    '#/play/shapes',
    async (page) => {
      const from = await center(page, '[data-piece="0"]')
      const to = await center(page, '[data-hole="0"]')
      await page.mouse.move(from.x, from.y)
      await page.mouse.down()
      await page.mouse.move(to.x, to.y, { steps: 12 })
      await page.mouse.up()
      await wait(700)
    },
  ],
  [
    'count',
    '#/play/count',
    async (page) => {
      for (const i of [1, 2]) {
        if (await page.locator(`[data-item="${i}"]`).count()) await page.click(`[data-item="${i}"]`)
      }
      await wait(500)
    },
  ],
  ['animals', '#/play/animals', async () => {}],
  ['balloons', '#/play/balloons', async () => wait(4500)],
  [
    'music',
    '#/play/music',
    async (page) => {
      await page.locator('.song').first().click()
      await wait(300)
      // The glowing bar pulses, so click by position instead of waiting for it to settle.
      for (const bar of [0, 1]) {
        const { x, y } = await center(page, `[data-bar="${bar}"]`)
        await page.mouse.click(x, y)
      }
      await wait(250)
    },
  ],
  [
    'memory',
    '#/play/memory',
    async (page) => {
      await page.click('[data-card="0"]')
      await page.click('[data-card="1"]')
      await wait(500)
    },
  ],
  ['album', '#/album', async () => wait(600)],
]

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Breaks a caption into lines of at most maxChars characters. */
function wrap(text, maxChars) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && `${line} ${word}`.length > maxChars) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  lines.push(line)
  return lines
}

async function compose(raw, caption, [top, bottom], dev) {
  const { W, H, viewport, shotH, shotY: y, capY, font, maxChars } = dev
  const shotW = Math.round((shotH * viewport.width) / viewport.height)
  const x = Math.round((W - shotW) / 2)
  const radius = 64

  const text = wrap(caption, maxChars)
    .map(
      (line, i) => `<text x="${W / 2}" y="${capY + i * font * 1.15}" text-anchor="middle"
      font-family="Arial Rounded MT Bold, Segoe UI, Arial, sans-serif" font-weight="800" font-size="${font}"
      fill="#ffffff" stroke="rgba(45,58,74,0.25)" stroke-width="6" paint-order="stroke">${escapeXml(line)}</text>`,
    )
    .join('')

  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}" /><stop offset="1" stop-color="${bottom}" />
    </linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)" />
    <rect x="${x}" y="${y + 24}" width="${shotW}" height="${shotH}" rx="${radius}" fill="rgba(0,0,0,0.18)" />
    ${text}
  </svg>`)

  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${shotW}" height="${shotH}"><rect width="${shotW}" height="${shotH}" rx="${radius}" /></svg>`,
  )
  const shot = await sharp(raw)
    .resize(shotW, shotH)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  return sharp(background)
    .composite([{ input: shot, left: x, top: y }])
    .flatten({ background: top })
    .png()
    .toBuffer()
}

const COLLECTED = [
  'lumi', 'animal-cat', 'animal-cow', 'animal-duck', 'animal-lion', 'animal-frog',
  'shape-heart', 'shape-star', 'shape-circle', 'thing-apple', 'thing-flower', 'balloon',
]
const GAMES = ['shapes', 'count', 'balloons', 'animals', 'memory', 'patterns', 'music']

const wanted = process.argv[2] ?? 'all'
const devices = wanted === 'all' ? Object.keys(DEVICES) : [wanted]
if (!devices.every((d) => d in DEVICES)) {
  console.error(`Unknown device "${wanted}". Use ipad, iphone or nothing for both.`)
  process.exit(1)
}

console.log('Building app…')
await build({ logLevel: 'warn' })
const server = await preview({ preview: { port: 4399, strictPort: true }, logLevel: 'warn' })
const base = 'http://localhost:4399/'
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {})

try {
  for (const device of devices) {
    const dev = DEVICES[device]
    for (const lang of Object.keys(CAPTIONS)) {
      const dir = join(OUT, device, lang)
      mkdirSync(dir, { recursive: true })
      const context = await browser.newContext({
        viewport: dev.viewport,
        deviceScaleFactor: dev.scale,
        locale: lang,
        hasTouch: device === 'iphone',
      })
      // Fresh state for each language: no demo hands, a half-filled album, silence.
      await context.addInitScript(
        ({ lang, games, collected }) => {
          localStorage.setItem('lumi.settings', JSON.stringify({ lang, sound: false, voice: false, music: false }))
          localStorage.setItem('lumi.seenGames', JSON.stringify(games))
          localStorage.setItem('lumi.stickers', JSON.stringify(collected))
        },
        { lang, games: GAMES, collected: COLLECTED },
      )

      for (const [index, [name, path, play]] of SCENES.entries()) {
        const page = await context.newPage()
        await page.goto(base + path)
        await wait(1300)
        await play(page)
        const raw = await page.screenshot()
        const file = join(dir, `${String(index + 1).padStart(2, '0')}-${name}.png`)
        await sharp(await compose(raw, CAPTIONS[lang][name], BACKGROUNDS[name], dev)).toFile(file)
        console.log(file)
        await page.close()
      }
      await context.close()
    }
  }
} finally {
  await browser.close()
  server.httpServer.close()
}
