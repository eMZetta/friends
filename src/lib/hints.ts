import { onBeforeUnmount, onMounted, ref } from 'vue'

import { say } from './speech'

/** Where the hint hand should tap, or drag from (x, y) to (toX, toY). Viewport coordinates. */
export interface HintTarget {
  x: number
  y: number
  toX?: number
  toY?: number
}

export interface Hint extends HintTarget {
  id: number
}

const IDLE_MS = 7000
const HAND_MS = 3400
const DEMO_DELAY_MS = 1600
const SEEN_KEY = 'lumi.seenGames'

let hintId = 0

export function centerOf(el: Element | null | undefined): { x: number; y: number } | null {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export function dragBetween(from: Element | null, to: Element | null): HintTarget | null {
  const a = centerOf(from)
  const b = centerOf(to)
  return a && b ? { x: a.x, y: a.y, toX: b.x, toY: b.y } : null
}

function seenGames(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

function markSeen(game: string) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seenGames(), game]))
  } catch {
    // Without storage the demo simply plays again next time.
  }
}

/**
 * Helps children who are stuck: after a quiet moment the instruction is repeated,
 * and if nothing happens again a hand shows what to do. The first time a game is
 * opened, the hand demonstrates it right away.
 */
export function useIdleHints(opts: {
  game: string
  prompt: () => string
  target: () => HintTarget | null
  paused?: () => boolean
}) {
  const hint = ref<Hint | null>(null)
  let level = 0
  let idleTimer: number | undefined
  let handTimer: number | undefined
  let demoTimer: number | undefined

  function schedule(ms = IDLE_MS) {
    window.clearTimeout(idleTimer)
    idleTimer = window.setTimeout(onIdle, ms)
  }

  function showHand() {
    const target = opts.target()
    if (!target) return
    hint.value = { ...target, id: hintId++ }
    window.clearTimeout(handTimer)
    handTimer = window.setTimeout(() => (hint.value = null), HAND_MS)
  }

  function onIdle() {
    if (opts.paused?.()) return schedule()
    level++
    say(opts.prompt())
    if (level >= 2) showHand()
    schedule(IDLE_MS + 2000)
  }

  function onActivity() {
    level = 0
    hint.value = null
    window.clearTimeout(demoTimer)
    schedule()
  }

  onMounted(() => {
    window.addEventListener('pointerdown', onActivity, true)
    schedule()
    if (!seenGames().includes(opts.game)) {
      markSeen(opts.game)
      demoTimer = window.setTimeout(() => {
        if (!opts.paused?.()) showHand()
      }, DEMO_DELAY_MS)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', onActivity, true)
    window.clearTimeout(idleTimer)
    window.clearTimeout(handTimer)
    window.clearTimeout(demoTimer)
  })

  return { hint }
}
