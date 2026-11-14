<script setup>
import { computed, ref } from 'vue'
import { PAGE_SIZE } from '../api/products.js'
import { usePrivateResource } from '../composables/usePrivateResource.js'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { useProductsStore } from '../stores/products.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'

const breadcrumbs = useBreadcrumbs()
const { withChanges } = useProductsStore()

const skip = ref(0)
const path = computed(() => {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(skip.value) })
  return `/auth/products?${params}`
})

const { data, error, isLoading, refetch } = usePrivateResource(path)

const products = computed(() => (data.value?.products ?? []).map(withChanges))
const total = computed(() => data.value?.total ?? 0)
const hasPrevious = computed(() => skip.value > 0)
const hasNext = computed(() => skip.value + PAGE_SIZE < total.value)

const priceFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function showPrevious() {
  if (!isLoading.value && hasPrevious.value)
    skip.value = Math.max(0, skip.value - PAGE_SIZE)
}

function showNext() {
  if (!isLoading.value && hasNext.value)
    skip.value += PAGE_SIZE
}
</script>

<template>
  <Breadcrumbs :items="breadcrumbs" />

  <section class="manage" aria-labelledby="manage-title">
    <h1 id="manage-title" class="manage__title">Керування товарами</h1>
    <p class="manage__note">
      DummyJSON не зберігає зміни на сервері. Збережені значення діють у цьому сеансі
      до перезавантаження сторінки або виходу. Пошук у каталозі працює з початковими даними
    </p>

    <div v-if="error" class="catalog__message catalog__message--error">
      <p class="catalog__message-index">ERR / API</p>
      <h2 class="catalog__message-title">Не вдалося отримати товари</h2>
      <p class="catalog__message-text">{{ error.message }}</p>
      <button class="catalog__retry" type="button" @click="refetch">
        Повторити запит
      </button>
    </div>

    <p v-else-if="isLoading" class="manage__status" aria-live="polite">
      Завантажуємо товари…
    </p>

    <ul v-else class="manage-list">
      <li v-for="product in products" :key="product.id" class="manage-list__item">
        <span class="manage-list__title">{{ product.title }}</span>
        <span class="manage-list__price">{{ priceFormatter.format(product.price) }}</span>
        <span class="manage-list__stock">Залишок: {{ product.stock }}</span>
        <RouterLink
          class="manage-list__edit"
          :to="{ name: 'manage-edit', params: { id: product.id } }"
        >
          Редагувати
        </RouterLink>
      </li>
    </ul>

    <nav class="manage-pager" aria-label="Сторінки товарів">
      <button
        class="manage-pager__button"
        type="button"
        :disabled="isLoading || !hasPrevious"
        @click="showPrevious"
      >
        Попередня
      </button>
      <span class="manage-pager__info">
        {{ total ? `${skip + 1}–${Math.min(skip + PAGE_SIZE, total)} із ${total}` : '—' }}
      </span>
      <button
        class="manage-pager__button"
        type="button"
        :disabled="isLoading || !hasNext"
        @click="showNext"
      >
        Наступна
      </button>
    </nav>
  </section>
</template>
