<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth.js'
import { useProductsStore } from './stores/products.js'

const auth = useAuthStore()
const { user, status, isAuthenticated, isBusy } = storeToRefs(auth)
const { logout, retryRestore } = auth

useProductsStore()
</script>

<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <a class="storefront__brand" href="#" aria-label="Forma, на початок">
        FORMA<span class="storefront__brand-mark">®</span>
      </a>
      <p class="storefront__edition">Лабораторна / 07</p>
      <p class="storefront__note">Каталог і composables</p>

      <nav class="storefront__nav" aria-label="Основна навігація">
        <RouterLink class="storefront__nav-link" :to="{ name: 'products' }">
          Каталог
        </RouterLink>
        <RouterLink class="storefront__nav-link" :to="{ name: 'about' }">
          Про застосунок
        </RouterLink>
      </nav>

      <div class="storefront__session" aria-live="polite">
        <template v-if="isAuthenticated">
          <span class="storefront__user">{{ user.firstName }} {{ user.lastName }}</span>
          <button class="storefront__session-action" type="button" @click="logout">
            Вийти
          </button>
        </template>

        <template v-else-if="status === 'unavailable'">
          <span class="storefront__user">Сеанс не перевірено</span>
          <button class="storefront__session-action" type="button" @click="retryRestore">
            Повторити перевірку
          </button>
        </template>

        <span v-else-if="isBusy" class="storefront__user">Перевірка сеансу…</span>

        <RouterLink v-else class="storefront__session-action" :to="{ name: 'login' }">
          Увійти
        </RouterLink>
      </div>
    </header>

    <RouterView />

    <footer class="storefront__footer">
      <p>Студент: Крюков Марк · 7.F2.25-2</p>
      <a href="https://dummyjson.com/docs/products" target="_blank" rel="noreferrer">
        Дані: DummyJSON
      </a>
    </footer>
  </main>
</template>
