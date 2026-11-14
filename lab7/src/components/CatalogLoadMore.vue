<script setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '../composables/useIntersectionObserver.js'

defineProps({
  loaded: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Object,
    default: null,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['load-more', 'retry'])

const marker = ref(null)

useIntersectionObserver(marker, () => emit('load-more'), {
  rootMargin: '280px 0px',
  threshold: 0.01,
})
</script>

<template>
  <div ref="marker" class="catalog__load-more">
    <span class="catalog__load-progress">{{ loaded }} / {{ total }}</span>
    <div class="catalog__load-copy">
      <template v-if="isLoading">
        <span class="catalog__load-spinner" aria-hidden="true"></span>
        <strong class="catalog__load-title">Завантажуємо наступні товари</strong>
        <span class="catalog__load-text">Уже показані картки залишаються на місці</span>
      </template>

      <template v-else-if="error">
        <strong class="catalog__load-title">Не вдалося отримати сторінку</strong>
        <button class="catalog__load-button" type="button" @click="emit('retry')">
          Повторити запит
        </button>
      </template>

      <template v-else-if="!hasMore">
        <strong class="catalog__load-title">Каталог завантажено повністю</strong>
        <span class="catalog__load-text">Нових запитів більше не буде</span>
      </template>

      <template v-else>
        <strong class="catalog__load-title">Прокрутіть далі</strong>
        <span class="catalog__load-text">
          Наступні товари завантажаться автоматично
        </span>
      </template>
    </div>
  </div>
</template>
