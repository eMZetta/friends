// Writes docs/voice-lines-<lang>.csv: every sentence the app speaks, with the file name
// its recording needs, and reports which recordings already exist.
//
//   yarn voice:lines

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { createServer } from 'vite'

const root = process.cwd()
const server = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
})

try {
  const { voiceLines } = await server.ssrLoadModule('/src/lib/voiceLines.ts')
  mkdirSync(join(root, 'docs'), { recursive: true })

  for (const lang of ['de', 'en']) {
    const dir = join(root, 'src/assets/audio/voice', lang)
    const recorded = new Set(
      existsSync(dir) ? readdirSync(dir).map((f) => f.replace(/\.[^.]+$/, '')) : [],
    )
    const lines = voiceLines(lang)
    const csv = [
      'file;text;recorded',
      ...lines.map(({ key, text }) => `${key}.mp3;"${text.replace(/"/g, '""')}";${recorded.has(key) ? 'yes' : 'no'}`),
    ].join('\n')
    writeFileSync(join(root, `docs/voice-lines-${lang}.csv`), `﻿${csv}\n`)

    const done = lines.filter((l) => recorded.has(l.key)).length
    console.log(`${lang}: ${lines.length} lines, ${done} recorded → docs/voice-lines-${lang}.csv`)
  }
} finally {
  await server.close()
}
