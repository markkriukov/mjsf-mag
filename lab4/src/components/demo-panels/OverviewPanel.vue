<script setup>
import { ref, computed, useId } from 'vue'

const uid = useId()

// Локальний стан панелі: текст нотатки.
const note = ref('')

const charCount = computed(() => note.value.length)
const wordCount = computed(() => {
  const trimmed = note.value.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
})
</script>

<template>
  <section class="space-y-4 text-left" :aria-labelledby="`${uid}-title`">
    <h2 :id="`${uid}-title`" class="text-xl font-semibold">Огляд</h2>

    <p class="text-sm">
      Введіть довільний текст, перейдіть на іншу вкладку і поверніться. Так можна
      перевірити, чи зберігся стан панелі.
    </p>

    <div class="space-y-2">
      <label :for="`${uid}-note`" class="block text-sm font-medium">Нотатка</label>
      <textarea
        :id="`${uid}-note`"
        v-model="note"
        rows="5"
        placeholder="Наприклад: перевірити KeepAlive…"
        class="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      ></textarea>
    </div>

    <p class="text-sm" aria-live="polite">
      Символів: <strong>{{ charCount }}</strong>,
      слів: <strong>{{ wordCount }}</strong>
    </p>

    <div
      v-if="note"
      class="rounded-lg border border-violet-300 bg-violet-50 p-3 text-gray-900 break-words whitespace-pre-wrap"
    >
      {{ note }}
    </div>
  </section>
</template>
