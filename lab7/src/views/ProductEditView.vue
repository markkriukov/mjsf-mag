<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProductsStore } from '../stores/products.js'
import { usePrivateResource } from '../composables/usePrivateResource.js'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import {
  EDITABLE_FIELDS,
  normalizeDraft,
  pickEditableFields,
  toDraft,
  validateDraft,
} from '../api/productDraft.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'

const route = useRoute()
const auth = useAuthStore()
const products = useProductsStore()

const productId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && /^[1-9]\d*$/.test(id) ? id : null
})

const path = computed(() =>
  productId.value ? `/auth/products/${productId.value}` : null,
)

const { data: product, error, isLoading, refetch } = usePrivateResource(path)

const isNotFound = computed(() =>
  productId.value === null || error.value?.status === 404,
)

const confirmed = ref(null)
const draft = reactive(toDraft(null))
const isSubmitted = ref(false)
const isSaving = ref(false)
const saveError = ref(null)
const isSaved = ref(false)

const errors = computed(() =>
  isSubmitted.value ? validateDraft(normalizeDraft(draft)) : {},
)

const isDirty = computed(() => {
  if (!confirmed.value)
    return false

  const initial = toDraft(confirmed.value)
  return EDITABLE_FIELDS.some((field) => draft[field] !== initial[field])
})

const breadcrumbs = useBreadcrumbs(() => {
  if (isNotFound.value)
    return 'Товар не знайдено'

  return confirmed.value?.title ?? `Товар №${route.params.id}`
})

function resetDraft() {
  Object.assign(draft, toDraft(confirmed.value))
  isSubmitted.value = false
  saveError.value = null
}

watch(product, (value) => {
  confirmed.value = value ? pickEditableFields(products.withChanges(value)) : null
  isSaved.value = false
  resetDraft()
})

watch(isDirty, (dirty) => {
  if (dirty)
    isSaved.value = false
})

async function submit() {
  if (isSaving.value)
    return

  isSubmitted.value = true
  const normalized = normalizeDraft(draft)
  const fieldErrors = validateDraft(normalized)
  const firstInvalid = EDITABLE_FIELDS.find((field) => fieldErrors[field])

  if (firstInvalid) {
    await nextTick()
    document.getElementById(`edit-${firstInvalid}`)?.focus()
    return
  }

  isSaving.value = true
  saveError.value = null

  try {
    confirmed.value = await products.save(productId.value, { ...normalized })
    resetDraft()
    isSaved.value = true
  } catch (cause) {
    if (cause.name !== 'AbortError')
      saveError.value = cause.message
  } finally {
    isSaving.value = false
  }
}

function confirmDiscard() {
  if (!isDirty.value || !auth.isAuthenticated)
    return true

  return window.confirm('Є незбережені зміни. Залишити редактор і втратити їх?')
}

onBeforeRouteLeave(() => confirmDiscard())

onBeforeRouteUpdate((to, from) => {
  if (to.params.id !== from.params.id)
    return confirmDiscard()
})

function onBeforeUnload(event) {
  if (isDirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

function describedBy(field) {
  return errors.value[field] ? `edit-${field}-error` : undefined
}
</script>

<template>
  <Breadcrumbs :items="breadcrumbs" />

  <section class="editor" aria-labelledby="editor-title">
    <h1 id="editor-title" class="editor__title">Редагування товару</h1>

    <div v-if="isNotFound" class="catalog__message">
      <p class="catalog__message-index">404 / PRODUCT</p>
      <h2 class="catalog__message-title">Товар не знайдено</h2>
      <p class="catalog__message-text">Перевірте адресу або поверніться до списку</p>
    </div>

    <div v-else-if="error" class="catalog__message catalog__message--error">
      <p class="catalog__message-index">ERR / API</p>
      <h2 class="catalog__message-title">Не вдалося отримати товар</h2>
      <p class="catalog__message-text">{{ error.message }}</p>
      <button class="catalog__retry" type="button" @click="refetch">
        Повторити запит
      </button>
    </div>

    <p v-else-if="isLoading || !confirmed" class="manage__status" aria-live="polite">
      Завантажуємо товар №{{ productId }}…
    </p>

    <form v-else class="editor__form" novalidate :aria-busy="isSaving" @submit.prevent="submit">
      <fieldset class="editor__fields" :disabled="isSaving">
        <div class="editor__field">
          <label class="editor__label" for="edit-title">Назва</label>
          <input
            id="edit-title"
            v-model="draft.title"
            class="editor__input"
            :aria-invalid="errors.title ? 'true' : undefined"
            :aria-describedby="describedBy('title')"
          />
          <p v-if="errors.title" id="edit-title-error" class="editor__error">{{ errors.title }}</p>
        </div>

        <div class="editor__field">
          <label class="editor__label" for="edit-price">Ціна, USD</label>
          <input
            id="edit-price"
            v-model="draft.price"
            class="editor__input"
            inputmode="decimal"
            :aria-invalid="errors.price ? 'true' : undefined"
            :aria-describedby="describedBy('price')"
          />
          <p v-if="errors.price" id="edit-price-error" class="editor__error">{{ errors.price }}</p>
        </div>

        <div class="editor__field">
          <label class="editor__label" for="edit-stock">Залишок</label>
          <input
            id="edit-stock"
            v-model="draft.stock"
            class="editor__input"
            inputmode="numeric"
            :aria-invalid="errors.stock ? 'true' : undefined"
            :aria-describedby="describedBy('stock')"
          />
          <p v-if="errors.stock" id="edit-stock-error" class="editor__error">{{ errors.stock }}</p>
        </div>

        <div class="editor__field">
          <label class="editor__label" for="edit-description">Опис</label>
          <textarea
            id="edit-description"
            v-model="draft.description"
            class="editor__input editor__input--multiline"
            rows="6"
            :aria-invalid="errors.description ? 'true' : undefined"
            :aria-describedby="describedBy('description')"
          ></textarea>
          <p v-if="errors.description" id="edit-description-error" class="editor__error">
            {{ errors.description }}
          </p>
        </div>
      </fieldset>

      <p v-if="saveError" class="editor__error" role="alert">
        Не вдалося зберегти: {{ saveError }}. Чернетку збережено, спробуйте ще раз
      </p>
      <p v-else-if="isSaved" class="editor__status" role="status">Зміни збережено</p>
      <p v-else-if="isDirty" class="editor__status">Є незбережені зміни</p>

      <div class="editor__actions">
        <button class="editor__submit" type="submit" :disabled="isSaving">
          {{ isSaving ? 'Зберігаємо…' : 'Зберегти' }}
        </button>
        <button
          class="editor__cancel"
          type="button"
          :disabled="isSaving || !isDirty"
          @click="resetDraft"
        >
          Скасувати зміни
        </button>
      </div>
    </form>
  </section>
</template>
