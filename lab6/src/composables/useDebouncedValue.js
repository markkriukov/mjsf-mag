import { readonly, ref, toValue, watch } from 'vue'

export function useDebouncedValue(source, delay = 400) {
  const debounced = ref(toValue(source))

  watch(
    () => toValue(source),
    (value, previousValue, onCleanup) => {
      const timer = setTimeout(() => {
        debounced.value = value
      }, delay)

      onCleanup(() => clearTimeout(timer))
    },
  )

  return readonly(debounced)
}
