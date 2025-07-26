<script setup lang="ts">
import { AppNavbar } from '#components'

// Initialize auth state with SSR-safe approach
const authStore = useAuthStore()

// Initialize auth state on mount
onMounted(async () => {
  await authStore.fetchSession()
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />
    <main>
      <slot />
    </main>
  </div>
</template>
