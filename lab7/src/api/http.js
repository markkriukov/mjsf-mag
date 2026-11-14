export const API_BASE_URL = 'https://dummyjson.com'

export async function requestJson(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined)
    headers['Content-Type'] = 'application/json'

  if (token)
    headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    credentials: 'omit',
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`

    try {
      const payload = await response.json()
      if (typeof payload?.message === 'string')
        message = payload.message
    } catch {
      // відповідь без JSON — лишаємо типове повідомлення
    }

    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return response.json()
}
