import { ref, toValue, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)
  const attempt = ref(0)
  let activeController = null

  watchEffect(async (onCleanup) => {
    const currentUrl = toValue(url)
    attempt.value

    const controller = new AbortController()
    activeController = controller
    onCleanup(() => controller.abort())

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(currentUrl, { signal: controller.signal })

      if (!response.ok)
        throw new Error(`HTTP ${response.status}`)

      data.value = await response.json()
    } catch (cause) {
      if (!controller.signal.aborted)
        error.value = cause
    } finally {
      if (activeController === controller)
        isLoading.value = false
    }
  })

  function abort() {
    activeController?.abort()
    isLoading.value = false
  }

  function refetch() {
    attempt.value++
  }

  return { data, error, isLoading, abort, refetch }
}
