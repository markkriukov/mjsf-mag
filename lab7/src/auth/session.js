const TOKEN_KEY = 'lab7.accessToken'

export function readStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function storeToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // сховище недоступне — сеанс діятиме до reload
  }
}

export function removeStoredToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // сховище недоступне — нічого вилучати
  }
}
