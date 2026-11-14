import { useAuthStore } from '../stores/auth.js'

const REDIRECT_TARGETS = ['manage-products', 'manage-edit']

export function installAuthGuard(router, pinia) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore(pinia)
    await auth.restore()

    if (to.meta.requiresAuth && !auth.isAuthenticated)
      return { name: 'login', query: { redirect: to.fullPath } }
  })
}

export function resolveLoginRedirect(router, redirect) {
  const fallback = { name: 'manage-products' }

  if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//'))
    return fallback

  const target = router.resolve(redirect)
  return REDIRECT_TARGETS.includes(target.name) ? target.fullPath : fallback
}
