// Bereitet eine Sprachaufnahme für die App auf und legt sie mit dem richtigen Dateinamen ab.
//
//   node scripts/import-voice.mjs <aufnahme> "<satz>" <de|en>
//
// Beispiel: node scripts/import-voice.mjs toll.mp3 "Toll gemacht!" de
//   → src/assets/audio/voice/de/toll-gemacht.mp3
//
// Schneidet Stille am Anfang und Ende ab, gleicht die Lautstärke an und schreibt MP3 mono, 44,1 kHz, 96 kbit/s.
// Der Dateiname wird wie in der App aus dem Satz gebildet (voiceKey), und der Satz muss in
// `yarn voice:lines` vorkommen, sonst wird er nie abgespielt. Braucht ffmpeg im PATH.

import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { createServer } from 'vite'

const [input, text, lang] = process.argv.slice(2)
if (!input || !text || !['de', 'en'].includes(lang)) {
  console.error('Aufruf: node scripts/import-voice.mjs <aufnahme> "<satz>" <de|en>')
  process.exit(1)
}

const root = process.cwd()
const server = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
})

try {
  const { voiceKey } = await server.ssrLoadModule('/src/lib/speech.ts')
  const { voiceLines } = await server.ssrLoadModule('/src/lib/voiceLines.ts')
  const key = voiceKey(text)
  if (!voiceLines(lang).some((line) => line.key === key)) {
    console.warn(`Hinweis: „${text}" kommt in der App nicht vor (yarn voice:lines), die Datei wird nie gespielt.`)
  }

  const dir = join(root, 'src/assets/audio/voice', lang)
  mkdirSync(dir, { recursive: true })
  const out = join(dir, `${key}.mp3`)

  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04'
  const filter = `${trim},areverse,${trim},areverse,loudnorm=I=-18:TP=-1.5:LRA=7`
  execFileSync(
    'ffmpeg',
    ['-y', '-v', 'error', '-i', input, '-af', filter, '-ac', '1', '-ar', '44100', '-b:a', '96k', out],
    { stdio: 'inherit' },
  )
  console.log(`Gespeichert: ${out}`)
} finally {
  await server.close()
}
