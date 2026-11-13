<script setup>
import { computed, inject, reactive, onMounted, onBeforeUnmount } from 'vue'
import { tabsKey } from './tabsKey.js'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  panel: {
    type: Object,
    default: null,
  },
  panelProps: {
    type: Object,
    default: () => ({}),
  },
})

const context = inject(tabsKey, null)

if (!context) {
  throw new Error('<Tab> можна використовувати лише всередині <Tabs>')
}

const { idPrefix } = context
const isActive = computed(() => context.activeSlug.value === props.slug)

onMounted(() => {
  context.registerTab(
    reactive({
      slug: computed(() => props.slug),
      title: computed(() => props.title),
      disabled: computed(() => props.disabled),
    })
  )
})

onBeforeUnmount(() => {
  context.unregisterTab(props.slug)
})
</script>

<template>
  <section
    :id="`${idPrefix}-panel-${slug}`"
    v-show="isActive"
    class="tabs__panel"
    role="tabpanel"
    :aria-labelledby="`${idPrefix}-tab-${slug}`"
    tabindex="0"
  >
    <KeepAlive>
      <slot v-if="isActive && $slots.default" :is-active="isActive" />
      <component :is="panel" v-else-if="isActive" v-bind="panelProps" />
    </KeepAlive>
  </section>
</template>

<style scoped lang="scss">
.tabs__panel {
  @apply p-4;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink;
}
</style>
