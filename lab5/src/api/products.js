const API_URL = 'https://dummyjson.com/products'

export const PAGE_SIZE = 12
export const API_DELAY = 1500

export function createProductsUrl(query, skip = 0) {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(skip),
    delay: String(API_DELAY),
  })

  if (!query)
    return `${API_URL}?${params}`

  params.set('q', query)
  return `${API_URL}/search?${params}`
}
