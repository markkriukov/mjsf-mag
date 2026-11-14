<script setup>
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const { error, isAuthenticated } = storeToRefs(useAuthStore())

watch(isAuthenticated, (authenticated) => {
  if (authenticated)
    return

  if (error.value)
    router.replace({ name: 'login', query: { redirect: route.fullPath } })
  else
    router.replace({ name: 'products' })
})
</script>

<template>
  <RouterView v-if="isAuthenticated" />
</template>
