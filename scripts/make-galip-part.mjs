// Renders the front, happy pose of the mascot component into assets/galip.svg.part (a static copy for the app icon).
// Run it after changing src/components/GalipMascot.vue, then `node scripts/make-assets.mjs`.
//
//   node scripts/make-galip-part.mjs

import { readFileSync, writeFileSync } from 'node:fs'

import { parse } from '@vue/compiler-sfc'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

const { descriptor } = parse(readFileSync('src/components/GalipMascot.vue', 'utf8'))
const script = descriptor.scriptSetup.content
const grab = (name) => JSON.parse(script.split(`const ${name} = `)[1].split('\n')[0])

const app = createSSRApp({
  template: descriptor.template.content,
  setup: () => ({
    uid: 'g',
    beadsFront: grab('beadsFront'),
    beadsSide: [],
    beadsBack: [],
    farLegs: [],
    nearLegs: [],
    legPath: () => '',
    bead: (i) => (i % 2 ? '#f2a23a' : '#fff3df'),
    pose: 'front',
    happy: true,
    shy: false,
    walking: false,
    flip: false,
    action: null,
  }),
})

let html = await renderToString(app)
html = html
  .replace(/<!--.*?-->/g, '')
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>$/, '')
  .replace(/<g class="lie-paws">.*?<\/g>/s, '')
  .replace(/ class="[^"]*"/g, '')
writeFileSync('assets/galip.svg.part', html)
console.log('assets/galip.svg.part', html.length, 'bytes')
