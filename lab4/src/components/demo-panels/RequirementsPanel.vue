<script setup>
import { ref, computed, useId } from 'vue'

const uid = useId()

// Локальний стан панелі: список вимог із позначками виконання.
const requirements = ref([
  { id: 1, text: 'Підключено Tailwind CSS', done: false },
  { id: 2, text: 'Перенесено ModalDialog.vue з лабораторної 3', done: false },
  { id: 3, text: 'Створено три демонстраційні панелі', done: false },
  { id: 4, text: 'Налаштовано перемикання вкладок', done: false },
  { id: 5, text: 'Перевірено збереження локального стану', done: false },
])

const doneCount = computed(
  () => requirements.value.filter((item) => item.done).length
)
const total = computed(() => requirements.value.length)
const allDone = computed(() => doneCount.value === total.value)

// Кнопка-лічильник позначає наступний невиконаний пункт.
function completeNext() {
  const next = requirements.value.find((item) => !item.done)
  if (next) next.done = true
}

function resetAll() {
  requirements.value.forEach((item) => {
    item.done = false
  })
}
</script>

<template>
  <section class="space-y-4 text-left" :aria-labelledby="`${uid}-title`">
    <h2 :id="`${uid}-title`" class="text-xl font-semibold">Вимоги</h2>

    <ul class="space-y-2">
      <li v-for="item in requirements" :key="item.id">
        <label
          class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
          :class="item.done ? 'border-green-400 bg-green-50 text-gray-900' : 'border-gray-300'"
        >
          <input
            v-model="item.done"
            type="checkbox"
            class="h-5 w-5 shrink-0 accent-green-600"
          />
          <span :class="{ 'line-through': item.done }">{{ item.text }}</span>
        </label>
      </li>
    </ul>

    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        :disabled="allDone"
        class="min-h-11 rounded-lg bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        aria-live="polite"
        @click="completeNext"
      >
        Виконано: {{ doneCount }} / {{ total }}
      </button>

      <button
        type="button"
        class="min-h-11 rounded-lg border border-gray-300 px-4 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        @click="resetAll"
      >
        Скинути
      </button>
    </div>

    <p v-if="allDone" class="font-medium text-green-700">Усі вимоги виконано!</p>
  </section>
</template>
