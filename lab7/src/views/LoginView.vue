<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { resolveLoginRedirect } from '../router/guards.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { user, status, error, isAuthenticated, isBusy } = storeToRefs(auth)
const { login } = auth

watch(isAuthenticated, (authenticated) => {
  if (authenticated)
    router.replace(resolveLoginRedirect(router, route.query.redirect))
})

const username = ref('')
const password = ref('')

async function submit() {
  if (isBusy.value)
    return

  const pending = login(username.value.trim(), password.value)
  password.value = ''
  await pending
}
</script>

<template>
  <section class="login" aria-labelledby="login-title">
    <h1 id="login-title" class="login__title">Вхід</h1>

    <p v-if="isAuthenticated" class="login__status" role="status">
      Ви увійшли як {{ user.firstName }} {{ user.lastName }}
    </p>

    <form class="login__form" :aria-busy="isBusy" @submit.prevent="submit">
      <div class="login__field">
        <label class="login__label" for="login-username">Ім'я користувача</label>
        <input
          id="login-username"
          v-model="username"
          class="login__input"
          name="username"
          autocomplete="username"
          required
          :disabled="isBusy"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? 'login-error' : undefined"
        />
      </div>

      <div class="login__field">
        <label class="login__label" for="login-password">Пароль</label>
        <input
          id="login-password"
          v-model="password"
          class="login__input"
          type="password"
          name="password"
          autocomplete="current-password"
          required
          :disabled="isBusy"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? 'login-error' : undefined"
        />
      </div>

      <p v-if="error" id="login-error" class="login__error" role="alert">{{ error }}</p>

      <button class="login__submit" type="submit" :disabled="isBusy">
        {{ status === 'signing-in' ? 'Входимо…' : 'Увійти' }}
      </button>
    </form>
  </section>
</template>
