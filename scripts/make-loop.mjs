// Macht aus einem Musikstück einen nahtlos loopenden Hintergrundtrack.
//
//   node scripts/make-loop.mjs <eingabe.mp3> [ueberblendung-in-sekunden]
//
// Schreibt src/assets/audio/music/loop.mp3. Der Schluss des Stücks wird über den Anfang geblendet,
// so dass das Ende direkt in den Anfang übergeht und beim Wiederholen kein Sprung zu hören ist.
// Braucht ffmpeg im PATH.

import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const [input, fade = '4'] = process.argv.slice(2)
if (!input) {
  console.error('Aufruf: node scripts/make-loop.mjs <eingabe.mp3> [ueberblendung-in-sekunden]')
  process.exit(1)
}

const x = Number(fade)
const duration = Number(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input], {
    encoding: 'utf8',
  }).trim(),
)
if (!Number.isFinite(duration) || duration < x * 3) {
  console.error(`Das Stück (${duration} s) ist zu kurz für ${x} s Überblendung.`)
  process.exit(1)
}

const out = join(process.cwd(), 'src/assets/audio/music/loop.mp3')
mkdirSync(dirname(out), { recursive: true })

// Datei = Überblendung(Schluss → Anfang) + Mittelteil. Das Dateiende ist dann der Punkt, an dem der Schluss beginnt.
const graph = [
  `[0]atrim=0:${x},asetpts=PTS-STARTPTS[head]`,
  `[0]atrim=${x}:${duration - x},asetpts=PTS-STARTPTS[body]`,
  `[0]atrim=${duration - x}:${duration},asetpts=PTS-STARTPTS[tail]`,
  `[tail][head]acrossfade=d=${x}:c1=tri:c2=tri[mix]`,
  `[mix][body]concat=n=2:v=0:a=1[out]`,
].join(';')

execFileSync(
  'ffmpeg',
  ['-y', '-v', 'error', '-i', input, '-filter_complex', graph, '-map', '[out]', '-ac', '2', '-ar', '44100', '-b:a', '112k', out],
  { stdio: 'inherit' },
)
console.log(`Loop geschrieben: ${out} (${(duration - x).toFixed(1)} s)`)
