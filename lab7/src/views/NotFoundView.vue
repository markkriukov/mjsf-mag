<script setup>
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const breadcrumbs = useBreadcrumbs()
</script>

<template>
  <Breadcrumbs :items="breadcrumbs" />

  <section class="catalog">
    <div class="catalog__heading">
      <h1 class="catalog__title">Сторінку не знайдено</h1>
    </div>
  </section>
</template>
