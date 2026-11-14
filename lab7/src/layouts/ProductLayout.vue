<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { createProductUrl } from '../api/products.js'
import { useFetch } from '../composables/useFetch.js'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { useProductsStore } from '../stores/products.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'

const route = useRoute()
const { withChanges } = useProductsStore()

const productId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && /^[1-9]\d*$/.test(id) ? id : null
})

const productUrl = computed(() =>
  productId.value ? createProductUrl(productId.value) : null,
)

const { data, error, isLoading, refetch } = useFetch(productUrl)
const product = computed(() => withChanges(data.value))

const isNotFound = computed(() =>
  productId.value === null || error.value?.status === 404,
)

const breadcrumbs = useBreadcrumbs(() => {
  if (isNotFound.value)
    return 'Товар не знайдено'

  return product.value?.title ?? `Товар №${route.params.id}`
})

const priceFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})
</script>

<template>
  <Breadcrumbs :items="breadcrumbs" />

  <section class="product-page">
    <div v-if="isNotFound" class="catalog__message">
      <p class="catalog__message-index">404 / PRODUCT</p>
      <h1 class="catalog__message-title">Товар не знайдено</h1>
      <p class="catalog__message-text">Перевірте адресу або поверніться до каталогу</p>
    </div>

    <div v-else-if="error" class="catalog__message catalog__message--error">
      <p class="catalog__message-index">ERR / API</p>
      <h1 class="catalog__message-title">Не вдалося отримати товар</h1>
      <p class="catalog__message-text">{{ error.message }}</p>
      <button class="catalog__retry" type="button" @click="refetch">
        Повторити запит
      </button>
    </div>

    <div v-else-if="isLoading || !product" class="catalog__message" aria-live="polite">
      <p class="catalog__message-index">LOADING</p>
      <h1 class="catalog__message-title">Завантажуємо товар №{{ productId }}</h1>
    </div>

    <template v-else>
      <div class="product-page__summary">
        <div class="product-page__visual">
          <img
            class="product-page__image"
            :src="product.thumbnail"
            :alt="product.title"
            width="420"
            height="420"
          />
        </div>

        <div class="product-page__info">
          <p class="product-page__category">{{ product.category }}</p>
          <h1 class="product-page__title">{{ product.title }}</h1>
          <strong class="product-page__price">
            {{ priceFormatter.format(product.price) }}
          </strong>
          <p class="product-page__meta">
            <span>Рейтинг {{ product.rating.toFixed(1) }} / 5</span>
            <span>
              {{ product.stock > 0 ? `У наявності · ${product.stock}` : 'Немає в наявності' }}
            </span>
          </p>
        </div>
      </div>

      <nav class="product-nav" aria-label="Розділи товару">
        <RouterLink
          class="product-nav__link"
          :to="{ name: 'product-overview', params: { id: route.params.id }, query: route.query }"
        >
          Огляд
        </RouterLink>
        <RouterLink
          class="product-nav__link"
          :to="{ name: 'product-reviews', params: { id: route.params.id }, query: route.query }"
        >
          Відгуки
        </RouterLink>
      </nav>

      <RouterView v-slot="{ Component }">
        <component :is="Component" :product="product" />
      </RouterView>
    </template>
  </section>
</template>
