<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import GameShell from '@/components/GameShell.vue'
import { COLORS } from '@/lib/colors'
import { useIdleHints, type HintTarget } from '@/lib/hints'
import { useT } from '@/lib/i18n'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

const SWATCHES = [...Object.values(COLORS), '#2d3a4a']
const BRUSH = 20

const t = useT()
const prompt = computed(() => t.value.paintPrompt)

const canvas = ref<HTMLCanvasElement | null>(null)
const color = ref<string>(COLORS.red)

// Each finger draws its own line, so several children (or two hands) can paint together.
const last = new Map<number, { x: number; y: number }>()
let observer: ResizeObserver | undefined

function ctx() {
  return canvas.value?.getContext('2d') ?? null
}

function point(e: PointerEvent) {
  const el = canvas.value!
  const r = el.getBoundingClientRect()
  const scale = el.width / r.width
  return { x: (e.clientX - r.left) * scale, y: (e.clientY - r.top) * scale }
}

function lineWidth() {
  const el = canvas.value!
  return BRUSH * (el.width / el.getBoundingClientRect().width)
}

function down(e: PointerEvent) {
  const c = ctx()
  if (!c) return
  canvas.value!.setPointerCapture(e.pointerId)
  const p = point(e)
  last.set(e.pointerId, p)
  // A single tap leaves a dot.
  c.fillStyle = color.value
  c.beginPath()
  c.arc(p.x, p.y, lineWidth() / 2, 0, Math.PI * 2)
  c.fill()
}

function move(e: PointerEvent) {
  const from = last.get(e.pointerId)
  const c = ctx()
  if (!from || !c) return
  const p = point(e)
  c.strokeStyle = color.value
  c.lineWidth = lineWidth()
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.beginPath()
  c.moveTo(from.x, from.y)
  c.lineTo(p.x, p.y)
  c.stroke()
  last.set(e.pointerId, p)
}

function up(e: PointerEvent) {
  last.delete(e.pointerId)
}

function pick(c: string) {
  color.value = c
  sfx.tap()
}

function clear() {
  const el = canvas.value
  if (!el) return
  ctx()?.clearRect(0, 0, el.width, el.height)
  sfx.tap()
}

// Keeps the canvas sharp on retina screens and keeps the drawing when the iPad is rotated.
function fit() {
  const el = canvas.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const w = Math.round(r.width * dpr)
  const h = Math.round(r.height * dpr)
  if (!w || !h || (el.width === w && el.height === h)) return

  const copy = document.createElement('canvas')
  copy.width = el.width
  copy.height = el.height
  if (el.width && el.height) copy.getContext('2d')?.drawImage(el, 0, 0)
  el.width = w
  el.height = h
  if (copy.width && copy.height) ctx()?.drawImage(copy, 0, 0)
}

// The hint hand shows how to draw: a stroke across the canvas.
const { hint } = useIdleHints({
  game: 'paint',
  prompt: () => prompt.value,
  target: (): HintTarget | null => {
    const r = canvas.value?.getBoundingClientRect()
    if (!r) return null
    return { x: r.left + r.width * 0.3, y: r.top + r.height * 0.4, toX: r.left + r.width * 0.7, toY: r.top + r.height * 0.6 }
  },
})

onMounted(() => {
  fit()
  observer = new ResizeObserver(fit)
  observer.observe(canvas.value!)
  say(prompt.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #fff1d6 0%, #ffd9e4 100%)">
    <div class="paint">
      <canvas
        ref="canvas"
        class="canvas"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
      />
      <div class="palette">
        <button
          v-for="c in SWATCHES"
          :key="c"
          class="swatch"
          :class="{ active: color === c }"
          :style="{ background: c }"
          :aria-label="c"
          @click="pick(c)"
        />
        <button class="clear" aria-label="Clear" @click="clear">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M12 16 H36 L33 40 H15 Z" fill="#fff" stroke="#2d3a4a" stroke-width="3" stroke-linejoin="round" />
            <path d="M9 16 H39 M19 16 V11 H29 V16" stroke="#2d3a4a" stroke-width="3" fill="none" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.paint {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.canvas {
  flex: 1;
  min-height: 0;
  width: 100%;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: var(--shadow);
  touch-action: none;
}

.palette {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.swatch {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 5px solid #fff;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
  transition: transform 0.12s;
}

.swatch.active {
  transform: scale(1.25);
  border-color: #2d3a4a;
}

.clear {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
  display: grid;
  place-items: center;
  margin-left: 12px;
}

.clear svg {
  width: 34px;
  height: 34px;
}
</style>
