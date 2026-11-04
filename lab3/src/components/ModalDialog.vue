<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'


const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  initialFocus: {
    default: null,
  },
  fallbackFocus: {
    default: null, // catalogHeading
  },
})

const emit = defineEmits(['update:modelValue'])

const panel = ref(null)
// Зберігаємо попередній фокус і стан фону до відкриття.
let previousActiveElement = null
let backgroundState = null

const titleId = 'material-modal-dialog-title'


// Перевіряємо, чи елемент ще в DOM, видимий і не заблокований.
function canReceiveFocus(element) {
  if (!(element instanceof HTMLElement)) return false
  if (!element.isConnected) return false

  const style = getComputedStyle(element)

  return (
    !element.matches(':disabled') &&
    !element.closest('[hidden], [inert]') &&
    element.getClientRects().length > 0 &&
    style.visibility !== 'hidden' &&
    style.visibility !== 'collapse'
  )
}

// Щоразу знаходимо видимі й доступні для Tab елементи вікна.
function getFocusableElements() {
  if (!panel.value) return []

  const selector = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    '[tabindex]',
    '[contenteditable="true"]',
  ].join(', ')

  return Array.from(
    panel.value.querySelectorAll(selector)
  ).filter((element) => {
    const style = getComputedStyle(element)

    return (
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      !element.closest('[hidden], [inert]') &&
      element.getClientRects().length > 0 &&
      style.visibility !== 'hidden' &&
      style.visibility !== 'collapse'
    )
  })
}

// Відкриття: фокус усередині та блокування фону.
// Фокусуємо переданий елемент або панель, якщо посилання ще null.
function focusInside() {
  if (!props.modelValue) return

  const target = props.initialFocus ?? panel.value

  target?.focus()
}

// Під час відкриття зберігаємо стан сторінки та блокуємо фон.
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) return

    if (backgroundState === null) {
      previousActiveElement = document.activeElement

      const app = document.querySelector('#app')

      backgroundState = {
        app,
        inert: app?.inert ?? false,
        overflow: document.body.style.overflow,
      }
    }

    // Чекаємо появи панелі й елементів форми в DOM.
    await nextTick()

    if (!props.modelValue || !panel.value) return

    // Встановлюємо фокус
    focusInside()

    if (backgroundState?.app) {
      backgroundState.app.inert = true
    }

    document.body.style.overflow = 'hidden'
  }
)

// Замикаємо переходи Tab і Shift+Tab усередині діалогу.
function handleTab(event) {
  const elements = getFocusableElements()

  if (elements.length === 0) {
    // За відсутності доступних елементів залишаємо фокус на панелі.
    event.preventDefault()
    panel.value?.focus()
    return
  }

  const first = elements[0]
  const last = elements[elements.length - 1]
  const activeIndex = elements.indexOf(document.activeElement)

  if (event.shiftKey) {
    if (activeIndex <= 0) {
      event.preventDefault()
      last.focus()
    }
  } else {
    if (
      activeIndex === -1 ||
      activeIndex === elements.length - 1
    ) {
      event.preventDefault()
      first.focus()
    }
  }
}

// Закриття: відновлення фону та попереднього фокуса.
// Повідомляємо каталог про закриття через v-model.
function closeDialog() {
  emit('update:modelValue', false)
}

// Повертаємо початкові значення inert і прокручування сторінки.
function restoreBackground() {
  if (backgroundState === null) return

  const { app, inert, overflow } = backgroundState

  if (app) {
    app.inert = inert
  }

  document.body.style.overflow = overflow

  backgroundState = null
}

// Відновлюємо фон і повертаємо фокус на кнопку або запасну ціль.
function cleanupDialog() {
  if (backgroundState === null) return

  restoreBackground()

  const target = canReceiveFocus(previousActiveElement)
    ? previousActiveElement
    : props.fallbackFocus

  if (canReceiveFocus(target)) {
    target.focus()
  }

  previousActiveElement = null
}

function restorePage() {
  // Не перериваємо роботу повторно відкритого вікна (якщо користувач швидко встиг його відкрити знову).
  if (props.modelValue) return

  cleanupDialog()
}

// Очищуємо стан також при демонтажі відкритого компонента (вихід зі сторінки при відкритому модульному вікні).
onBeforeUnmount(cleanupDialog)
</script>

<template>
  <Teleport to="body">
    <Transition
    enter-active-class="transition-opacity duration-150 motion-reduce:transition-none"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 motion-reduce:transition-none"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
    @after-enter="focusInside"
    @after-leave="restorePage"
    >     
       <!-- click.self закриває вікно при натисканні на фон. -->
      <div
        v-if="props.modelValue"
        class="fixed inset-0 bg-black/50 p-4 box-border flex items-center justify-center"        
        @click.self="closeDialog" 
      >
        <section
          ref="panel"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          @keydown.esc.stop.prevent="closeDialog"
          @keydown.tab="handleTab"
          class="box-border w-full max-w-screen-sm max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden rounded-xl bg-white p-6 text-gray-900 shadow-xl"
        >
          <header class="mb-4 flex shrink-0 items-start justify-between gap-4">
            <h2 :id="titleId" class="min-w-0 break-words text-xl font-semibold">
              {{ props.title }}
            </h2>

            <button
            type="button"
            aria-label="Закрити вікно"
            @click="closeDialog"
            class="shrink-0 min-h-11 min-w-11 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
                <span aria-hidden="true">✕</span>
            </button>
          </header>

          <div class="min-h-0 overflow-y-auto break-words">
          <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="mt-6 shrink-0 flex flex-col gap-3 sm:flex-row sm:justify-end"
          >
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
