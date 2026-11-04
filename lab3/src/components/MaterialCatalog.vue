<script setup>
import { reactive, ref, computed} from 'vue'
import { materials } from '../data/materials.js'
import MaterialFilterForm from './MaterialFilterForm.vue'
import MaterialCard from './MaterialCard.vue'
import ModalDialog from './ModalDialog.vue'


const isOpen = ref(false)
const dialogTitle = ref('Заголовок')

const items = ref(materials.map(material => ({ ...material })))
const selectedId = ref(items.value[0]?.id ?? null)
const draft = ref({ title: '', minutes: '' })

const editingId = ref(null)
const error = ref('')
// Поле назви отримує початковий фокус під час редагування.
const titleInput = ref(null)

// Режим визначає вміст і кнопки діалогу.
const mode = ref('edit')
const deleteTarget = ref(null)
// Безпечна початкова ціль фокуса у вікні видалення.
const cancelButton = ref(null)

// Запасна ціль фокуса, якщо кнопку виклику видалено разом із карткою.
const catalogHeading = ref(null)

// Заповнюємо чернетку даними матеріалу та відкриваємо редагування.
function openEdit(id) {
  const material = items.value.find(item => item.id === id)
  if (!material) return

  mode.value = 'edit'

  editingId.value = id

  draft.value = {
    title: material.title,
    minutes: material.minutes,
  }

  error.value = ''
  dialogTitle.value = 'Редагування матеріалу'
  isOpen.value = true
}

// Перевіряємо дані й оновлюємо матеріал лише після підтвердження.
function saveEdit() {
  error.value = ''

  const title = draft.value.title.trim()
  const minutes = Number(draft.value.minutes)

  if (!title) {
    error.value = 'Введіть назву матеріалу.'
    return
  }

  if (!Number.isInteger(minutes) || minutes <= 0) {
    error.value = 'Тривалість має бути цілим числом більше нуля.'
    return
  }

  const index = items.value.findIndex(
    item => item.id === editingId.value
  )

  if (index === -1) {
    error.value = 'Матеріал не знайдено.'
    return
  }

  items.value[index] = {
    ...items.value[index],
    title,
    minutes,
  }

  isOpen.value = false
}

// Зберігаємо матеріал для підтвердження; поки не видаляємо його.
function openDelete(id) {
  const material = items.value.find(item => item.id === id)
  if (!material) return

  mode.value = 'delete'
  deleteTarget.value = { ...material }
  dialogTitle.value = 'Видалення матеріалу'
  error.value = ''

  isOpen.value = true
}

// Видаляємо підтверджений матеріал і за потреби оновлюємо вибір.
function confirmDelete() {
  if (!deleteTarget.value) return

  const deletedId = deleteTarget.value.id

  items.value = items.value.filter(item => item.id !== deletedId)

  if (selectedId.value === deletedId) {
    selectedId.value = items.value[0]?.id ?? null
  }

  isOpen.value = false
}

const activeFilters = reactive({
  query: '',
  topic: 'all',
})

const selectedTitle = computed(() => {
  return items.value.find(item => item.id === selectedId.value)?.title ?? ''
})

function applyFilters(payload) {
  activeFilters.query = payload.query
  activeFilters.topic = payload.topic
}

function clearFilters() {
  activeFilters.query = ''
  activeFilters.topic = 'all'
}

const filteredMaterials = computed(() =>
  items.value.filter((material) => {
    const matchesQuery = material.title
      .toLowerCase()
      .includes(activeFilters.query.toLowerCase())
    const matchesTopic =
      activeFilters.topic === 'all' || material.topic === activeFilters.topic
    return matchesQuery && matchesTopic
  })
)

const totalMinutes = computed(() =>
  filteredMaterials.value.reduce((sum, material) => sum + material.minutes, 0)
)
</script>

<template>
  <section class="material-catalog" aria-labelledby="catalog-title">
    <!-- Передаємо стан, початкову та запасну цілі фокуса в діалог. -->
    <ModalDialog v-model="isOpen" 
                :title="dialogTitle"   
                :initial-focus="mode === 'edit' ? titleInput : cancelButton"
                :fallback-focus="catalogHeading">      

      <form
        v-if="mode === 'edit'"
        id="material-edit-form"
        class="space-y-4"
        @submit.prevent="saveEdit"
      >
        <div>
          <label for="material-title" class="mb-1 block">
            Назва
          </label>

          <input
            id="material-title"
            ref="titleInput"
            v-model="draft.title"
            type="text"
            required
            class="box-border w-full min-w-0 max-w-full min-h-11 rounded border p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700"
          />
        </div>

        <div>
          <label for="material-minutes" class="mb-1 block">
            Тривалість у хвилинах
          </label>

          <input
            id="material-minutes"
            v-model="draft.minutes"
            type="number"
            required
            min="1"
            step="1"
            class="box-border w-full min-w-0 max-w-full min-h-11 rounded border p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700"
          />
        </div>

        <p v-if="error" role="alert" class="text-red-600">
          {{ error }}
        </p>
      </form>

      <p v-else-if="mode === 'delete'">
        Видалити матеріал «{{ deleteTarget?.title }}»?
        Його буде вилучено з каталогу. Цю дію неможливо скасувати.
      </p>

      <template #footer>
        <template v-if="mode === 'edit'">
          <button
            type="button"
            class="min-h-11 min-w-11 rounded bg-gray-200 px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            @click="isOpen = false"
          >
            Скасувати
          </button>

          <button
            type="submit"
            form="material-edit-form"
            class="min-h-11 min-w-11 rounded bg-blue-600 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Зберегти
          </button>
        </template>
        <template v-else-if="mode === 'delete'">
          <button
            ref="cancelButton"
            type="button"
            class="min-h-11 min-w-11 rounded bg-gray-200 px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            @click="isOpen = false"
          >
            Скасувати
          </button>

          <button
            type="button"
            class="min-h-11 min-w-11 rounded bg-red-600 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            @click="confirmDelete"
          >
            Видалити
          </button>
        </template>
      </template>
    </ModalDialog>

    <div class="material-catalog__heading">
      <div>
        <!-- tabindex="-1" дозволяє програмно повернути фокус на заголовок. АЛЕ пропускає його при навігації клавішею Tab -->
        <h2 ref="catalogHeading" tabindex="-1" class="material-catalog__title" id="catalog-title">
          Каталог матеріалів
        </h2>
      </div>
      <p class="material-catalog__summary">
        <strong class="material-catalog__count">
          Знайдено: {{ filteredMaterials.length }}
        </strong>
        <span aria-hidden="true">·</span>
        Загальна тривалість: {{ totalMinutes }} хв
      </p>
    </div>

    <MaterialFilterForm @apply="applyFilters" @clear="clearFilters" />

    <p class="selection-status" aria-live="polite">
      <span class="selection-status__label">Обраний матеріал</span>
      <strong class="selection-status__value">{{ selectedTitle }}</strong>
    </p>

    <p v-if="items.length === 0">
      У каталозі поки немає матеріалів.
    </p>

    <div v-if="filteredMaterials.length" class="material-list">
      <MaterialCard
        v-for="material in filteredMaterials"
        :key="material.id"
        :id="material.id"
        :title="material.title"
        :topic="material.topic"
        :description="material.description"
        :minutes="material.minutes"
        :selected="material.id === selectedId"
        @select="selectedId = material.id"
        @delete="openDelete(material.id)"
        @edit="openEdit(material.id)"
      />
    </div>

    <p v-else class="empty-state">
      За заданими умовами матеріалів немає.
    </p>
  </section>
</template>
