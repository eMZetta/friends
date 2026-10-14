// Checks the App Store texts in docs/STORE.md against Apple's length limits.
//
//   yarn store:check

import { readFileSync } from 'node:fs'

const LIMITS = { name: 30, subtitle: 30, promo: 170, keywords: 100, description: 4000, whatsnew: 4000 }

const text = readFileSync('docs/STORE.md', 'utf8')
const blocks = [...text.matchAll(/<!-- store:(\w+):(\w+) -->\n([\s\S]*?)\n<!-- \/store -->/g)]

let failed = false
for (const [, lang, field, value] of blocks) {
  const limit = LIMITS[field]
  // Apple counts keywords in bytes; the other fields in characters.
  const length = field === 'keywords' ? Buffer.byteLength(value, 'utf8') : [...value].length
  const ok = length <= limit
  if (!ok) failed = true
  if (field === 'keywords' && /,\s/.test(value)) {
    failed = true
    console.log(`✗ ${lang} keywords: no spaces after commas`)
  }
  console.log(`${ok ? '✓' : '✗'} ${lang} ${field.padEnd(11)} ${String(length).padStart(4)} / ${limit}`)
}

if (failed) process.exit(1)
