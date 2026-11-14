<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PAGE_SIZE, createProductsUrl } from '../api/products.js'
import { useFetch } from '../composables/useFetch.js'
import { useDebouncedValue } from '../composables/useDebouncedValue.js'
import ProductSearchForm from '../components/ProductSearchForm.vue'
import ProductCatalog from '../components/ProductCatalog.vue'
import CatalogLoadMore from '../components/CatalogLoadMore.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const breadcrumbs = useBreadcrumbs()

const route = useRoute()
const router = useRouter()

const confirmedQuery = computed(() =>
  typeof route.query.q === 'string' ? route.query.q : '',
)

const query = ref(confirmedQuery.value)
const skip = ref(0)
const products = ref([])
const total = ref(0)
const requestUrl = computed(() =>
  createProductsUrl(confirmedQuery.value, skip.value),
)

const { data, error, isLoading, abort, refetch } = useFetch(requestUrl)

const hasMore = computed(() => products.value.length < total.value)

const edit = ref(null)
const debouncedEdit = useDebouncedValue(edit, 400)
const isEditPending = ref(false)
let isRequestCanceled = false

function onSearchInput(value) {
  query.value = value

  if (isLoading.value)
    isRequestCanceled = true

  abort()
  isEditPending.value = true
  edit.value = { query: value }
}

watch(debouncedEdit, (current) => {
  if (!current)
    return

  isEditPending.value = false
  const nextQuery = current.query.trim()

  if (nextQuery !== confirmedQuery.value) {
    isRequestCanceled = false
    router.replace({
      name: 'products',
      query: nextQuery ? { q: nextQuery } : {},
    })
    return
  }

  if (isRequestCanceled) {
    isRequestCanceled = false
    refetch()
  }
})

watch(
  confirmedQuery,
  (nextQuery) => {
    skip.value = 0
    products.value = []
    total.value = 0

    if (query.value.trim() !== nextQuery) {
      query.value = nextQuery
      edit.value = null
      isEditPending.value = false
    }
  },
  { flush: 'sync' },
)

watch(data, (page) => {
  if (!page)
    return

  total.value = page.total

  if (page.skip === 0) {
    products.value = page.products
    return
  }

  const knownIds = new Set(products.value.map((product) => product.id))
  products.value = [
    ...products.value,
    ...page.products.filter((product) => !knownIds.has(product.id)),
  ]
})

function loadMore() {
  if (
    !hasMore.value
    || isLoading.value
    || isEditPending.value
    || error.value
  )
    return

  skip.value += PAGE_SIZE
}
</script>

<template>
  <Breadcrumbs :items="breadcrumbs" />

  <section class="storefront__hero">
    <div class="storefront__intro">
      <p class="storefront__eyebrow">Заготовка інтерфейсу</p>
      <h1 class="storefront__title">
        Речі з ясною
        <em class="storefront__title-accent">формою</em>
      </h1>
    </div>

    <ProductSearchForm
      :model-value="query"
      @update:model-value="onSearchInput"
      :is-loading="isLoading"
      :error="error"
      :loaded="products.length"
      :total="total"
    />
  </section>

  <section class="catalog" aria-labelledby="catalog-title">
    <div class="catalog__heading">
      <h2 id="catalog-title" class="catalog__title">Початкова добірка</h2>
      <span class="catalog__count">{{ products.length.toString().padStart(2, '0') }}</span>
    </div>

    <ProductCatalog
      :products="products"
      :is-loading="isLoading"
      :error="error"
      @retry="refetch"
    />

    <CatalogLoadMore
      v-if="products.length"
      :loaded="products.length"
      :total="total"
      :is-loading="isLoading"
      :error="error"
      :has-more="hasMore"
      @load-more="loadMore"
      @retry="refetch"
    />
  </section>
</template>
