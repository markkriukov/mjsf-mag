import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.js'
import { pickEditableFields } from '../api/productDraft.js'

function staleOperation() {
  return new DOMException('Операція застаріла', 'AbortError')
}

export const useProductsStore = defineStore('products', () => {
  const auth = useAuthStore()
  const confirmedChanges = ref({})

  let resetEpoch = 0
  let operationId = 0
  const latestOperation = new Map()
  const controllers = new Set()

  function withChanges(product) {
    const changes = product && confirmedChanges.value[product.id]
    return changes ? { ...product, ...changes } : product
  }

  async function save(id, draft) {
    const key = String(id)
    const fields = pickEditableFields(draft)
    const token = auth.accessToken
    const epoch = resetEpoch
    const operation = ++operationId
    const controller = new AbortController()

    latestOperation.set(key, operation)
    controllers.add(controller)

    try {
      const response = await auth.request(`/auth/products/${key}`, {
        method: 'PATCH',
        body: fields,
        signal: controller.signal,
      })

      const isCurrent = epoch === resetEpoch
        && latestOperation.get(key) === operation
        && auth.isAuthenticated
        && auth.accessToken === token

      if (!isCurrent)
        throw staleOperation()

      const saved = pickEditableFields({ ...fields, ...response })
      confirmedChanges.value = { ...confirmedChanges.value, [key]: saved }
      return saved
    } finally {
      controllers.delete(controller)
    }
  }

  function reset() {
    resetEpoch += 1
    controllers.forEach((controller) => controller.abort())
    controllers.clear()
    latestOperation.clear()
    confirmedChanges.value = {}
  }

  watch(() => auth.accessToken, () => reset(), { flush: 'sync' })

  return { confirmedChanges, withChanges, save, reset }
})
