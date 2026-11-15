<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import GameShell from '@/components/GameShell.vue'
import ProgressDots from '@/components/ProgressDots.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import ShapeIcon from '@/components/ShapeIcon.vue'
import { COLORS } from '@/lib/colors'
import { useLevel } from '@/lib/difficulty'
import { centerOf, dragBetween, useIdleHints } from '@/lib/hints'
import { useT, type ShapeKind } from '@/lib/i18n'
import { pick, shuffle } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

interface Piece {
  id: number
  kind: ShapeKind
  color: string
  placed: boolean
}

const KINDS: ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'heart', 'hexagon']

const GOAL = 3

interface Item {
  id: number
  kind: ShapeKind
  color: string
}

const t = useT()

// Three kinds of round: drag shapes into holes, find a named shape, or spot the odd one out.
const mode = ref<'drag' | 'find' | 'odd'>('drag')
const items = ref<Item[]>([])
const answerId = ref(0)
const findKind = ref<ShapeKind>('circle')
const taskId = ref(0)
const found = ref(0)
const solved = ref(false)
const wobblingId = ref<number | null>(null)
let timer: number | undefined

const prompt = computed(() => {
  if (mode.value === 'find') return t.value.shapesFind(findKind.value)
  if (mode.value === 'odd') return t.value.shapesOdd
  return t.value.shapesPrompt
})

const levelOf = useLevel()
const round = ref(0)
const pieces = ref<Piece[]>([])
const holeOrder = ref<Piece[]>([])
const trayOrder = ref<Piece[]>([])
const celebrating = ref(false)
const wrongId = ref<number | null>(null)

const drag = reactive({ id: null as number | null, startX: 0, startY: 0, dx: 0, dy: 0 })
const holeEls = new Map<number, Element>()

function setHoleEl(id: number, el: unknown) {
  if (el instanceof Element) holeEls.set(id, el)
  else holeEls.delete(id)
}

function newTask() {
  const colors = shuffle(Object.values(COLORS))
  const size = levelOf(round.value) >= 3 ? 5 : 4
  if (mode.value === 'find') {
    const kinds = shuffle(KINDS).slice(0, size)
    items.value = kinds.map((kind, id) => ({ id, kind, color: colors[id] as string }))
    const target = pick(items.value)
    answerId.value = target.id
    findKind.value = target.kind
  } else {
    // Several of one shape in one colour and a single different one: only the form gives it away.
    const [same, odd] = shuffle(KINDS) as [ShapeKind, ShapeKind]
    const color = colors[0] as string
    const list = [...Array.from({ length: size - 1 }, () => same), odd]
    items.value = shuffle(list).map((kind, id) => ({ id, kind, color }))
    answerId.value = items.value.find((x) => x.kind === odd)!.id
  }
  taskId.value++
  solved.value = false
  say(prompt.value)
}

function tapItem(item: Item) {
  if (solved.value || celebrating.value) return
  if (item.id === answerId.value) {
    solved.value = true
    found.value++
    sfx.snap()
    say(t.value.shapes[item.kind])
    timer = window.setTimeout(() => {
      if (found.value >= GOAL) celebrating.value = true
      else newTask()
    }, 1600)
  } else {
    wobblingId.value = item.id
    sfx.tap()
    say(t.value.shapes[item.kind])
    window.setTimeout(() => (wobblingId.value = null), 500)
  }
}

function newRound() {
  found.value = 0
  if (round.value === 0) mode.value = 'drag'
  else {
    // Never the same kind of round twice in a row; the odd-one-out game starts a bit later.
    const options = (['drag', 'find', 'odd'] as const).filter(
      (m) => m !== mode.value && (m !== 'odd' || levelOf(round.value) >= 1),
    )
    mode.value = pick(options)
  }
  if (mode.value !== 'drag') {
    newTask()
    return
  }
  // Start with two shapes and slowly add more, up to four.
  const count = Math.min(2 + Math.floor(levelOf(round.value) / 2), 4)
  const colors = shuffle(Object.values(COLORS))
  const list = shuffle(KINDS)
    .slice(0, count)
    .map((kind, i) => reactive<Piece>({ id: i, kind, color: colors[i] as string, placed: false }))
  pieces.value = list
  holeOrder.value = shuffle(list)
  trayOrder.value = shuffle(list)
}

function center(rect: DOMRect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function onDown(e: PointerEvent, piece: Piece) {
  if (piece.placed || drag.id !== null || celebrating.value) return
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  drag.id = piece.id
  drag.startX = e.clientX
  drag.startY = e.clientY
  drag.dx = 0
  drag.dy = 0
  sfx.tap()
}

function onMove(e: PointerEvent, piece: Piece) {
  if (drag.id !== piece.id) return
  drag.dx = e.clientX - drag.startX
  drag.dy = e.clientY - drag.startY
}

function onUp(e: PointerEvent, piece: Piece) {
  if (drag.id !== piece.id) return
  const p = center((e.currentTarget as Element).getBoundingClientRect())
  drag.id = null

  // Find the hole closest to where the piece was dropped. Toddlers aren't precise,
  // so anything within ~0.8 hole widths counts.
  let best: { id: number; dist: number; size: number } | null = null
  for (const [id, el] of holeEls) {
    const rect = el.getBoundingClientRect()
    const h = center(rect)
    const dist = Math.hypot(h.x - p.x, h.y - p.y)
    if (!best || dist < best.dist) best = { id, dist, size: rect.width }
  }

  if (best && best.dist < best.size * 0.8) {
    if (best.id === piece.id) {
      place(piece)
      return
    }
    const target = pieces.value.find((x) => x.id === best.id)
    if (target && !target.placed) {
      sfx.wrong()
      wrongId.value = piece.id
      window.setTimeout(() => (wrongId.value = null), 500)
    }
  }
}

function onCancel(piece: Piece) {
  if (drag.id === piece.id) drag.id = null
}

function place(piece: Piece) {
  piece.placed = true
  sfx.snap()
  say(t.value.shapes[piece.kind])
  if (pieces.value.every((x) => x.placed)) {
    window.setTimeout(() => (celebrating.value = true), 700)
  }
}

function nextRound() {
  celebrating.value = false
  round.value++
  newRound()
}

function pieceStyle(piece: Piece) {
  if (drag.id !== piece.id) return undefined
  return { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.12)` }
}

const { hint } = useIdleHints({
  game: 'shapes',
  prompt: () => prompt.value,
  paused: () => celebrating.value || drag.id !== null || solved.value,
  target: () => {
    if (mode.value !== 'drag') return centerOf(document.querySelector(`[data-find="${answerId.value}"]`))
    const piece = trayOrder.value.find((p) => !p.placed)
    if (!piece) return null
    return dragBetween(
      document.querySelector(`[data-piece="${piece.id}"]`),
      document.querySelector(`[data-hole="${piece.id}"]`),
    )
  },
})

onMounted(() => {
  newRound()
  say(prompt.value)
})
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #ffd9e4 0%, #fff1d6 100%)">
    <template v-if="mode !== 'drag'" #status>
      <ProgressDots :total="GOAL" :done="found" color="#f15bb5" />
    </template>

    <div v-if="mode !== 'drag'" class="find">
      <button
        v-for="(it, i) in items"
        :key="`${taskId}-${it.id}`"
        class="find-item"
        :data-find="it.id"
        :class="{
          wobble: wobblingId === it.id,
          cheer: solved && it.id === answerId,
          dim: solved && it.id !== answerId,
        }"
        :style="{ animationDelay: `${i * 80}ms` }"
        @click="tapItem(it)"
      >
        <ShapeIcon :kind="it.kind" :color="it.color" />
      </button>
    </div>

    <div v-if="mode === 'drag'" class="board">
      <div class="holes">
        <div v-for="p in holeOrder" :key="p.id" :ref="(el) => setHoleEl(p.id, el)" class="slot hole" :data-hole="p.id">
          <ShapeIcon v-if="!p.placed" :kind="p.kind" hole />
          <div v-else class="filled">
            <ShapeIcon :kind="p.kind" :color="p.color" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="mode === 'drag'" class="tray">
      <div v-for="p in trayOrder" :key="p.id" class="slot">
        <div
          v-if="!p.placed"
          class="piece"
          :data-piece="p.id"
          :class="{ dragging: drag.id === p.id, wrong: wrongId === p.id }"
          :style="pieceStyle(p)"
          @pointerdown="onDown($event, p)"
          @pointermove="onMove($event, p)"
          @pointerup="onUp($event, p)"
          @pointercancel="onCancel(p)"
        >
          <ShapeIcon :kind="p.kind" :color="p.color" />
        </div>
      </div>
    </div>

    <RewardBurst :show="celebrating" @done="nextRound" />
  </GameShell>
</template>

<style scoped>
.board {
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  width: min(94%, 980px);
  height: 46%;
  background: #fff;
  border-radius: 40px;
  box-shadow: 0 10px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.find {
  position: absolute;
  inset: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: calc(4 * var(--u));
}

.find-item {
  --size: min(calc(22 * var(--u)), 200px);
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  padding: calc(var(--size) * 0.1);
  border-radius: 32%;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.1);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.find-item:active {
  transform: scale(0.94);
}

.find-item.cheer {
  animation: cheer 0.45s ease-in-out infinite alternate;
  background: #fff;
}

.find-item.dim {
  opacity: 0.35;
}

.find-item.wobble {
  animation: wobble 0.45s;
}

@keyframes pop-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes cheer {
  from {
    transform: translateY(0) scale(1.05);
  }
  to {
    transform: translateY(-10%) scale(1.15);
  }
}

.holes,
.tray {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
}

.tray {
  position: absolute;
  bottom: 4%;
  left: 0;
  height: 40%;
}

.slot {
  --size: min(calc(24 * var(--u)), 220px);
  width: var(--size);
  height: var(--size);
  position: relative;
}

.filled {
  width: 100%;
  height: 100%;
  animation: snap-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.piece {
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 6px 0 rgba(0, 0, 0, 0.12));
}

.piece.dragging {
  transition: none;
  z-index: 10;
  position: relative;
  filter: drop-shadow(0 14px 8px rgba(0, 0, 0, 0.2));
}

.piece.wrong {
  animation: wobble 0.45s;
}

@keyframes snap-in {
  from {
    transform: scale(1.4);
  }
  to {
    transform: scale(1);
  }
}

@keyframes wobble {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-12deg);
  }
  75% {
    transform: rotate(12deg);
  }
}
</style>
