<script setup lang="ts">
import { AppNavbar, AppNotificationToast } from '#components'

const authStore = useAuthStore()
await authStore.init()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />
    <main>
      <slot />
    </main>
    <AppNotificationToast />
  </div>
</template>
