<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const reviews = computed(() => props.product.reviews ?? [])

const dateFormatter = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long' })
</script>

<template>
  <section class="product-reviews" aria-labelledby="product-reviews-title">
    <h2 id="product-reviews-title" class="product-reviews__title">Відгуки</h2>

    <ul v-if="reviews.length" class="product-reviews__list">
      <li
        v-for="(review, index) in reviews"
        :key="`${review.reviewerName}-${index}`"
        class="product-reviews__item"
      >
        <div class="product-reviews__header">
          <strong class="product-reviews__author">{{ review.reviewerName }}</strong>
          <span class="product-reviews__rating">{{ review.rating }} / 5</span>
          <time class="product-reviews__date" :datetime="review.date">
            {{ dateFormatter.format(new Date(review.date)) }}
          </time>
        </div>
        <p class="product-reviews__text">{{ review.comment }}</p>
      </li>
    </ul>

    <p v-else class="product-reviews__empty">Для цього товару ще немає відгуків</p>
  </section>
</template>
