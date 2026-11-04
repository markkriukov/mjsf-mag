<script setup>
defineProps({
  id:          { type: Number, default: 0 },
  title:       { type: String,  required: true },
  topic:       { type: String,  required: true },
  description: { type: String,  required: true },
  minutes:     { type: Number,  required: true },
  selected:    { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'edit', 'delete'])
</script>

<template>
  <article
    class="material-card"
    :class="[`material-card--${topic}`, { 'material-card--selected': selected }]"
  >
    <div class="material-card__meta">
      <span class="material-card__number">{{ id }}</span>
      <span class="material-card__topic">{{ topic }}</span>
    </div>

    <h3 class="material-card__title">{{ title }}</h3>

    <p class="material-card__description">{{ description }}</p>

    <div class="material-card__footer">
      <span class="material-card__duration">{{ minutes }} хв</span>
      <button
        class="material-card__action"
        type="button"
        :aria-pressed="selected"
        @click="emit('select', title)"
      >
        <template v-if="selected">Обрано <span aria-hidden="true">✓</span></template>
        <template v-else>Обрати</template>
      </button>      
    </div>
    <div class="mt-3 flex gap-2">
      <button
        type="button"
        class="flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        @click.stop="emit('edit')"
      >
        Редагувати
      </button>

      <button
        type="button"
        class="flex-1 rounded-lg border border-red-200 bg-transparent px-3 py-2 text-sm text-red-700 hover:bg-red-50"
        @click.stop="emit('delete')"
      >
        Видалити
      </button>
    </div>
  </article>
</template>
