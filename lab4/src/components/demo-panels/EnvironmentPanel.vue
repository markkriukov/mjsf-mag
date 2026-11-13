<script setup>
import { ref, useId, version as vueVersion } from 'vue'
import ModalDialog from '../ModalDialog.vue'
import pkg from '../../../package.json'

const uid = useId()

// Відомості про середовище розробки.
const environment = [
  { label: 'Vue (runtime)', value: vueVersion },
  { label: 'Vite', value: pkg.devDependencies.vite },
  { label: 'Tailwind CSS', value: pkg.devDependencies.tailwindcss },
  { label: 'Режим збірки', value: import.meta.env.MODE },
  { label: 'Dev-сервер', value: import.meta.env.DEV ? 'так' : 'ні' },
]

// Локальний стан панелі: діалог, лічильник відкриттів і текст із діалогу.
const isDialogOpen = ref(false)
const openCount = ref(0)
const draftComment = ref('')
const savedComment = ref('')

// Посилання для керування фокусом у ModalDialog.
const openButton = ref(null)
const commentInput = ref(null)

function openDialog() {
  draftComment.value = savedComment.value
  openCount.value++
  isDialogOpen.value = true
}

function saveComment() {
  savedComment.value = draftComment.value.trim()
  isDialogOpen.value = false
}
</script>

<template>
  <section class="space-y-4 text-left" :aria-labelledby="`${uid}-title`">
    <h2 :id="`${uid}-title`" class="text-xl font-semibold">Середовище</h2>

    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg border border-gray-300 p-4">
      <template v-for="item in environment" :key="item.label">
        <dt class="font-medium">{{ item.label }}</dt>
        <dd class="m-0 font-mono">{{ item.value }}</dd>
      </template>
    </dl>

    <div class="flex flex-wrap items-center gap-3">
      <button
        ref="openButton"
        type="button"
        class="min-h-11 rounded-lg bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        @click="openDialog"
      >
        Відкрити діалог
      </button>
      <span class="text-sm">Відкрито разів: <strong>{{ openCount }}</strong></span>
    </div>

    <p class="text-sm">
      Коментар:
      <strong v-if="savedComment" class="break-words">{{ savedComment }}</strong>
      <em v-else>ще не додано</em>
    </p>

    <ModalDialog
      v-model="isDialogOpen"
      title="Коментар до середовища"
      :initial-focus="commentInput"
      :fallback-focus="openButton"
    >
      <label :for="`${uid}-comment`" class="mb-2 block text-sm font-medium">
        Що варто перевірити в цьому середовищі?
      </label>
      <input
        :id="`${uid}-comment`"
        ref="commentInput"
        v-model="draftComment"
        type="text"
        class="w-full rounded-lg border border-gray-300 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        @keydown.enter.prevent="saveComment"
      />

      <template #footer>
        <button
          type="button"
          class="min-h-11 rounded-lg border border-gray-300 px-4 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          @click="isDialogOpen = false"
        >
          Скасувати
        </button>
        <button
          type="button"
          class="min-h-11 rounded-lg bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          @click="saveComment"
        >
          Зберегти
        </button>
      </template>
    </ModalDialog>
  </section>
</template>
