import { ref, toValue, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'

export function usePrivateResource(path) {
  const auth = useAuthStore()
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)
  const attempt = ref(0)

  watch(
    [() => toValue(path), attempt],
    ([currentPath], previous, onCleanup) => {
      data.value = null
      error.value = null

      if (!currentPath) {
        isLoading.value = false
        return
      }

      const controller = new AbortController()
      let isActive = true

      onCleanup(() => {
        isActive = false
        controller.abort()
      })

      isLoading.value = true

      auth.request(currentPath, { signal: controller.signal })
        .then((result) => {
          if (isActive)
            data.value = result
        })
        .catch((cause) => {
          if (isActive && cause.name !== 'AbortError')
            error.value = cause
        })
        .finally(() => {
          if (isActive)
            isLoading.value = false
        })
    },
    { immediate: true },
  )

  function refetch() {
    attempt.value++
  }

  return { data, error, isLoading, refetch }
}
