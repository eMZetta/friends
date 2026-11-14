import { onBeforeUnmount, ref, type Ref } from 'vue'

/** Reactive `matchMedia`, so layouts that depend on the number of columns can follow device rotation. */
export function useMedia(query: string): Ref<boolean> {
  const mq = window.matchMedia(query)
  const matches = ref(mq.matches)
  const update = () => (matches.value = mq.matches)
  mq.addEventListener('change', update)
  onBeforeUnmount(() => mq.removeEventListener('change', update))
  return matches
}

/** True when the screen is taller than wide (iPhone/iPad held upright). */
export function usePortrait(): Ref<boolean> {
  return useMedia('(max-aspect-ratio: 1/1)')
}
