import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { requestJson } from '../api/http.js'
import { readStoredToken, removeStoredToken, storeToken } from '../auth/session.js'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const user = ref(null)
  const status = ref('idle')
  const error = ref(null)

  const isAuthenticated = computed(() =>
    status.value === 'authenticated' && Boolean(accessToken.value) && Boolean(user.value),
  )

  const isBusy = computed(() =>
    status.value === 'restoring' || status.value === 'signing-in',
  )

  let sessionEpoch = 0
  let controller = null
  let restorePromise = null

  function startOperation() {
    controller?.abort()
    controller = new AbortController()
    return { epoch: sessionEpoch, signal: controller.signal }
  }

  function clearSession() {
    sessionEpoch += 1
    controller?.abort()
    controller = null
    removeStoredToken()
    accessToken.value = null
    user.value = null
  }

  function expireSession() {
    clearSession()
    status.value = 'guest'
    error.value = 'Сеанс завершився. Увійдіть знову'
  }

  async function request(path, options = {}) {
    const token = accessToken.value
    const epoch = sessionEpoch

    try {
      return await requestJson(path, { ...options, token })
    } catch (cause) {
      if (cause.status === 401 && epoch === sessionEpoch && accessToken.value === token)
        expireSession()

      throw cause
    }
  }

  async function login(username, password) {
    if (isBusy.value)
      return false

    const previousStatus = status.value
    sessionEpoch += 1
    const { epoch, signal } = startOperation()
    status.value = 'signing-in'
    error.value = null

    try {
      const { accessToken: token, refreshToken, ...profile } = await requestJson('/auth/login', {
        method: 'POST',
        body: { username, password, expiresInMins: 30 },
        signal,
      })

      if (epoch !== sessionEpoch)
        return false

      storeToken(token)
      accessToken.value = token
      user.value = profile
      status.value = 'authenticated'
      return true
    } catch (cause) {
      if (epoch !== sessionEpoch || cause.name === 'AbortError')
        return false

      status.value = previousStatus
      error.value = cause.status === 400
        ? 'Неправильне ім\'я користувача або пароль'
        : 'Не вдалося увійти. Перевірте мережу й спробуйте ще раз'
      return false
    }
  }

  async function verifyStoredToken() {
    const token = readStoredToken()

    if (!token) {
      status.value = 'guest'
      return
    }

    const { epoch, signal } = startOperation()
    status.value = 'restoring'
    error.value = null

    try {
      const profile = await requestJson('/auth/me', { token, signal })

      if (epoch !== sessionEpoch)
        return

      accessToken.value = token
      user.value = profile
      status.value = 'authenticated'
    } catch (cause) {
      if (epoch !== sessionEpoch || cause.name === 'AbortError')
        return

      if (cause.status === 401) {
        expireSession()
        return
      }

      status.value = 'unavailable'
      error.value = 'Не вдалося перевірити сеанс. Перевірте мережу й повторіть перевірку'
    }
  }

  function restore() {
    if (restorePromise)
      return restorePromise

    if (status.value !== 'idle')
      return Promise.resolve()

    restorePromise = verifyStoredToken().finally(() => {
      restorePromise = null
    })
    return restorePromise
  }

  function retryRestore() {
    if (status.value === 'unavailable')
      status.value = 'idle'

    return restore()
  }

  function logout() {
    clearSession()
    status.value = 'guest'
    error.value = null
  }

  return {
    accessToken,
    user,
    status,
    error,
    isAuthenticated,
    isBusy,
    login,
    restore,
    retryRestore,
    logout,
    request,
  }
})
