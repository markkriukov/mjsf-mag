import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'

const PRODUCT_ROUTES = ['product-overview', 'product-reviews', 'manage-edit']

export function useBreadcrumbs(productTitle) {
  const route = useRoute()

  return computed(() =>
    route.matched
      .filter((record) => record.meta.breadcrumb)
      .map((record) => {
        const { label, name, dynamic } = record.meta.breadcrumb
        const to = { name }

        if (PRODUCT_ROUTES.includes(name))
          to.params = { id: route.params.id }

        if (typeof route.query.q === 'string')
          to.query = { q: route.query.q }

        return {
          label: dynamic === 'product' ? toValue(productTitle) : label,
          to,
        }
      }),
  )
}
