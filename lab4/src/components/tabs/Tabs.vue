<script setup>
import { ref, computed, provide, useId, useAttrs, onBeforeUnmount } from 'vue'
import { tabsKey } from './tabsKey.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'underline',
    validator: (value) => ['underline', 'pills', 'boxed'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue'])

const activeSlug = computed(() => props.modelValue)
const idPrefix = useId()
const tabs = ref([])
const buttons = new Map()
let isUnmounting = false

const getTabId = (slug) => `${idPrefix}-tab-${slug}`
const getPanelId = (slug) => `${idPrefix}-panel-${slug}`

const enabledTabs = computed(() => tabs.value.filter((tab) => !tab.disabled))

function setActiveTab(slug) {
  const tab = tabs.value.find((item) => item.slug === slug)

  if (!tab || tab.disabled || slug === props.modelValue) return

  emit('update:modelValue', slug)
}

function registerTab(tab) {
  if (tabs.value.some((item) => item.slug === tab.slug)) {
    throw new Error(`[Tabs] Повторний slug "${tab.slug}"`)
  }

  tabs.value.push(tab)

  // Порядок кнопок — як у розмітці, навіть для Tab, доданих пізніше через v-if.
  tabs.value.sort((a, b) => {
    const elA = document.getElementById(getPanelId(a.slug))
    const elB = document.getElementById(getPanelId(b.slug))
    if (!elA || !elB) return 0
    return elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  })
}

function unregisterTab(slug) {
  tabs.value = tabs.value.filter((item) => item.slug !== slug)

  if (!isUnmounting && slug === props.modelValue && enabledTabs.value.length > 0) {
    emit('update:modelValue', enabledTabs.value[0].slug)
  }
}

onBeforeUnmount(() => {
  isUnmounting = true
})

provide(tabsKey, {
  activeSlug,
  idPrefix,
  setActiveTab,
  registerTab,
  unregisterTab,
})

const focusableSlug = computed(() => {
  const active = enabledTabs.value.find((tab) => tab.slug === props.modelValue)
  return (active ?? enabledTabs.value[0])?.slug ?? null
})

function setButtonRef(slug, el) {
  if (el) buttons.set(slug, el)
  else buttons.delete(slug)
}

function handleKeydown(event, slug) {
  const list = enabledTabs.value
  if (list.length === 0) return

  const index = list.findIndex((tab) => tab.slug === slug)
  let next

  switch (event.key) {
    case 'ArrowRight':
      next = list[(index + 1) % list.length]
      break
    case 'ArrowLeft':
      next = list[(index - 1 + list.length) % list.length]
      break
    case 'Home':
      next = list[0]
      break
    case 'End':
      next = list[list.length - 1]
      break
    default:
      return
  }

  event.preventDefault()
  setActiveTab(next.slug)
  buttons.get(next.slug)?.focus()
}

const attrs = useAttrs()

const rootAttrs = computed(() => {
  const { 'aria-label': _, ...rest } = attrs
  return rest
})

const variantClasses = {
  underline: 'tabs--underline',
  pills: 'tabs--pills',
  boxed: 'tabs--boxed',
}
</script>

<template>
  <div class="tabs" :class="variantClasses[variant]" v-bind="rootAttrs">
    <div role="tablist" :aria-label="attrs['aria-label'] ?? 'Вкладки'" class="tabs__list">
      <button
        v-for="tab in tabs"
        :id="getTabId(tab.slug)"
        :key="tab.slug"
        :ref="(el) => setButtonRef(tab.slug, el)"
        type="button"
        role="tab"
        :aria-selected="tab.slug === modelValue ? 'true' : 'false'"
        :aria-controls="getPanelId(tab.slug)"
        :tabindex="tab.slug === focusableSlug ? 0 : -1"
        :disabled="tab.disabled"
        class="tabs__tab"
        :class="{ 'tabs__tab--active': tab.slug === modelValue }"
        @click="setActiveTab(tab.slug)"
        @keydown="handleKeydown($event, tab.slug)"
      >
        <span class="tabs__label">{{ tab.title }}</span>
      </button>
    </div>

    <slot />
  </div>
</template>

<style scoped lang="scss">
.tabs {
  $self: &;

  @apply overflow-hidden rounded-xl border border-edge bg-paper text-left;

  &__list {
    @apply flex flex-wrap gap-x-1 px-2;
  }

  &__tab {
    @apply flex min-h-11 items-center px-4 py-2 text-sm font-semibold text-muted;
    @apply transition-colors enabled:hover:text-ink;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink;
    @apply disabled:cursor-not-allowed disabled:opacity-40;
  }

  &__label {
    @apply whitespace-nowrap;
  }

  &--underline {
    #{$self}__list {
      @apply border-b-2 border-edge;
    }

    #{$self}__tab {
      @apply -mb-0.5 border-b-2 border-transparent;
    }

    #{$self}__tab--active {
      @apply border-accent text-ink;
    }
  }

  &--pills {
    #{$self}__list {
      @apply gap-2 border-b border-edge p-2;
    }

    #{$self}__tab {
      @apply rounded-full enabled:hover:bg-surface;
    }

    #{$self}__tab--active {
      @apply bg-ink text-paper enabled:hover:bg-ink enabled:hover:text-paper;
    }
  }

  &--boxed {
    #{$self}__list {
      @apply border-b border-edge bg-surface pt-2;
    }

    #{$self}__tab {
      @apply -mb-px rounded-t-lg border border-transparent;
    }

    #{$self}__tab--active {
      @apply border-edge border-b-paper bg-paper text-ink;
    }
  }
}
</style>
