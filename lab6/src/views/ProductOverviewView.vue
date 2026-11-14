<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const specs = computed(() => {
  const { brand, sku, weight, dimensions, warrantyInformation, shippingInformation, returnPolicy, minimumOrderQuantity } = props.product

  return [
    ['Бренд', brand],
    ['Артикул', sku],
    ['Вага', weight],
    ['Розміри (Ш × В × Г)', dimensions && `${dimensions.width} × ${dimensions.height} × ${dimensions.depth}`],
    ['Гарантія', warrantyInformation],
    ['Доставка', shippingInformation],
    ['Повернення', returnPolicy],
    ['Мінімальне замовлення', minimumOrderQuantity],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '')
})
</script>

<template>
  <section class="product-overview" aria-labelledby="product-overview-title">
    <h2 id="product-overview-title" class="product-overview__title">Огляд</h2>
    <p class="product-overview__description">{{ product.description }}</p>

    <dl class="product-overview__specs">
      <div v-for="[term, value] in specs" :key="term" class="product-overview__spec">
        <dt class="product-overview__term">{{ term }}</dt>
        <dd class="product-overview__value">{{ value }}</dd>
      </div>
    </dl>
  </section>
</template>
