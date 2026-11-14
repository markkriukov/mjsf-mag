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

    data.value = null
    error.value = null

    if (!currentUrl) {
      activeController = null
      isLoading.value = false
      return
    }

    const controller = new AbortController()
    activeController = controller
    onCleanup(() => controller.abort())

    const isCurrent = () =>
      activeController === controller && !controller.signal.aborted

    isLoading.value = true

    try {
      const response = await fetch(currentUrl, { signal: controller.signal })

      if (!response.ok) {
        const httpError = new Error(`HTTP ${response.status}`)
        httpError.status = response.status
        throw httpError
      }

      const result = await response.json()

      if (isCurrent())
        data.value = result
    } catch (cause) {
      if (isCurrent())
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
