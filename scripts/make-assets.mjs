// Renders the app icon and splash screen (Galip at dusk) from SVG into assets/*.png, which
// `npx capacitor-assets generate --ios` then turns into every size Xcode needs.
//
//   yarn assets

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import sharp from 'sharp'

const root = process.cwd()
const galip = readFileSync(join(root, 'assets/galip.svg.part'), 'utf8')

const defs = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4b3f9e" />
      <stop offset="0.58" stop-color="#d9709a" />
      <stop offset="0.85" stop-color="#ffb77e" />
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0%" stop-color="#fff7b0" />
      <stop offset="40%" stop-color="#ffe27a" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#ffe27a" stop-opacity="0" />
    </radialGradient>
  </defs>`

// Glowing firefly dot, like the ones drifting over the home screen.
function firefly(x, y, r) {
  return `<circle cx="${x}" cy="${y}" r="${r * 4}" fill="url(#glow)" /><circle cx="${x}" cy="${y}" r="${r}" fill="#ffe27a" />`
}

// App icon: no transparency allowed, iOS rounds the corners itself.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${defs}
  <rect width="1024" height="1024" fill="url(#sky)" />
  <ellipse cx="512" cy="1150" rx="760" ry="330" fill="#3f7f86" />
  <ellipse cx="300" cy="1190" rx="640" ry="300" fill="#2c6a5c" />
  ${firefly(170, 190, 22)}
  ${firefly(860, 250, 16)}
  ${firefly(820, 120, 11)}
  ${firefly(220, 720, 13)}
  <g transform="translate(112 92) scale(4)">${galip}</g>
</svg>`

// Splash: Galip small in the middle, safe for any crop of the 2732×2732 square.
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  ${defs}
  <rect width="2732" height="2732" fill="url(#sky)" />
  <g transform="translate(1066 1016) scale(3)">${galip}</g>
</svg>`

for (const [name, svg] of [
  ['icon-only.png', icon],
  ['splash.png', splash],
  ['splash-dark.png', splash],
]) {
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#4b3f9e' }).png().toBuffer()
  writeFileSync(join(root, 'assets', name), png)
  console.log(`assets/${name}`)
}

// Favicons: at 16–48 px the whole scene is unreadable, so they show only Galip's face on the dusk sky.
const face = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="26 30 148 148">
  ${defs}
  <rect x="26" y="30" width="148" height="148" fill="url(#sky)" />
  ${galip}
</svg>`

async function facePng(size) {
  return sharp(Buffer.from(face)).resize(size, size).png().toBuffer()
}

/** An .ico file that holds PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + images.length * 16
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size, 0)
    entry.writeUInt8(size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)])
}

const sizes = [16, 32, 48]
const favicon = ico(await Promise.all(sizes.map(async (size) => ({ size, png: await facePng(size) }))))
for (const dir of ['public', 'website']) writeFileSync(join(root, dir, 'favicon.ico'), favicon)
writeFileSync(join(root, 'public/favicon.png'), await facePng(192))

// iOS "Add to Home Screen": full-bleed square, iOS rounds the corners itself.
const touch = await sharp(join(root, 'assets/icon-only.png')).resize(180, 180).png().toBuffer()
writeFileSync(join(root, 'public/apple-touch-icon.png'), touch)
console.log('public/favicon.ico, favicon.png, apple-touch-icon.png, website/favicon.ico')
