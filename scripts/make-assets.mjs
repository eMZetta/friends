// Renders the app icon and splash screen from SVG into assets/*.png, which
// `npx capacitor-assets generate --ios` then turns into every size Xcode needs.
//
//   yarn assets

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import sharp from 'sharp'

const root = process.cwd()
const lumi = readFileSync(join(root, 'assets/lumi.svg.part'), 'utf8')

const defs = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7fd3f7" />
      <stop offset="1" stop-color="#d9f4ff" />
    </linearGradient>
    <radialGradient id="tailGlow">
      <stop offset="0%" stop-color="#fff7b0" />
      <stop offset="45%" stop-color="#ffe14d" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#ffe14d" stop-opacity="0" />
    </radialGradient>
  </defs>`

function star(x, y, r, color) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const d = i % 2 ? r * 0.45 : r
    return `${(x + Math.cos(a) * d).toFixed(1)},${(y + Math.sin(a) * d).toFixed(1)}`
  })
  return `<polygon points="${pts.join(' ')}" fill="${color}" stroke-linejoin="round" />`
}

// App icon: no transparency allowed, iOS rounds the corners itself.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${defs}
  <rect width="1024" height="1024" fill="url(#sky)" />
  <ellipse cx="512" cy="1150" rx="760" ry="330" fill="#8bd17c" />
  ${star(170, 190, 46, '#ffd23f')}
  ${star(860, 250, 34, '#ffffff')}
  ${star(820, 120, 22, '#ffd23f')}
  ${star(220, 720, 26, '#ffffff')}
  <g transform="translate(112 92) scale(4)">${lumi}</g>
</svg>`

// Splash: Lumi small in the middle, safe for any crop of the 2732×2732 square.
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  ${defs}
  <rect width="2732" height="2732" fill="url(#sky)" />
  <g transform="translate(1066 1016) scale(3)">${lumi}</g>
</svg>`

for (const [name, svg] of [
  ['icon-only.png', icon],
  ['splash.png', splash],
  ['splash-dark.png', splash],
]) {
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#7fd3f7' }).png().toBuffer()
  writeFileSync(join(root, 'assets', name), png)
  console.log(`assets/${name}`)
}
