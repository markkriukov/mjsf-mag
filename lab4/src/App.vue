<script setup>
import { ref, version as vueVersion } from 'vue'
import Tabs from './components/tabs/Tabs.vue'
import Tab from './components/tabs/Tab.vue'
import OverviewPanel from './components/demo-panels/OverviewPanel.vue'
import RequirementsPanel from './components/demo-panels/RequirementsPanel.vue'
import EnvironmentPanel from './components/demo-panels/EnvironmentPanel.vue'
import pkg from '../package.json'

const student = {
  name: 'Крюков М.',
  group: '7.F2.25-2',
}

const environment = [
  'Windows 11 Pro',
  'Chromium',
  'Node.js 25.9.0',
  `Vue ${vueVersion}`,
  `Vite ${pkg.devDependencies.vite}`,
  `Tailwind CSS ${pkg.devDependencies.tailwindcss}`,
].join(' · ')

const underlineTab = ref('overview')
const pillsTab = ref('requirements')
const boxedTab = ref('environment')

const pillsTabs = [
  { slug: 'overview', title: 'Огляд', panel: OverviewPanel, panelProps: {} },
  { slug: 'requirements', title: 'Вимоги', panel: RequirementsPanel, panelProps: {} },
  { slug: 'environment', title: 'Середовище', panel: EnvironmentPanel, panelProps: {} },
]
</script>

<template>
  <div class="page">
    <header class="page__header">
      <dl class="student">
        <div class="student__item">
          <dt class="student__label">Студент</dt>
          <dd class="student__value">{{ student.name }}</dd>
        </div>
        <div class="student__item">
          <dt class="student__label">Група</dt>
          <dd class="student__value">{{ student.group }}</dd>
        </div>
        <div class="student__item student__item--wide">
          <dt class="student__label">Середовище</dt>
          <dd class="student__value">{{ environment }}</dd>
        </div>
      </dl>

      <h1 class="page__title">Лабораторна робота № 4 · Слоти та provide/inject</h1>
    </header>

    <main class="page__content">
      <section class="page__section" aria-labelledby="set-underline">
        <h2 id="set-underline" class="page__subtitle">underline · панелі через слоти</h2>

        <Tabs v-model="underlineTab" variant="underline" aria-label="Основний набір">
          <Tab slug="overview" title="Огляд">
            <OverviewPanel />
          </Tab>
          <Tab slug="requirements" title="Вимоги">
            <RequirementsPanel />
          </Tab>
          <Tab slug="environment" title="Середовище">
            <EnvironmentPanel />
          </Tab>
        </Tabs>
      </section>

      <section class="page__section" aria-labelledby="set-pills">
        <h2 id="set-pills" class="page__subtitle">pills · v-for за конфігурацією</h2>

        <Tabs v-model="pillsTab" variant="pills" aria-label="Набір із конфігураційного масиву">
          <Tab
            v-for="tab in pillsTabs"
            :key="tab.slug"
            :slug="tab.slug"
            :title="tab.title"
            :panel="tab.panel"
            :panel-props="tab.panelProps"
          />
        </Tabs>
      </section>

      <section class="page__section" aria-labelledby="set-boxed">
        <h2 id="set-boxed" class="page__subtitle">boxed · вимкнена вкладка та ModalDialog</h2>

        <Tabs v-model="boxedTab" variant="boxed" aria-label="Набір із вимкненою вкладкою">
          <Tab slug="environment" title="Середовище">
            <EnvironmentPanel />
          </Tab>
          <Tab slug="notes" title="Нотатка">
            <OverviewPanel />
          </Tab>
          <Tab slug="archive" title="Архів" disabled>
            <RequirementsPanel />
          </Tab>
        </Tabs>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.page {
  @apply mx-auto min-h-screen max-w-4xl px-4 py-8;

  &__header {
    @apply space-y-6;
  }

  &__title {
    @apply text-2xl font-bold text-ink;
  }

  &__content {
    @apply mt-8 space-y-10;
  }

  &__section {
    @apply space-y-3;
  }

  &__subtitle {
    @apply text-sm font-semibold uppercase tracking-wide text-muted;
  }
}

.student {
  @apply grid gap-3 sm:grid-cols-2;

  &__item {
    @apply rounded-lg border border-edge bg-paper px-4 py-2;

    &--wide {
      @apply sm:col-span-2;
    }
  }

  &__label {
    @apply text-xs font-semibold uppercase tracking-wide text-muted;
  }

  &__value {
    @apply break-words font-semibold text-ink;
  }
}
</style>
