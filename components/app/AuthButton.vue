<script setup lang="ts">
import { useAuthStore } from '#imports'

// Use Pinia store for auth state
const authStore = useAuthStore()
</script>

<template>
  <div>
    <!-- Sign in button for unauthenticated users -->
    <button
      v-if="!authStore.isAuthenticated"
      class="btn btn-accent"
      :disabled="authStore.loading"
      @click="() => authStore.signIn()"
    >
      Sign in with GitHub
      <span
        v-if="authStore.loading"
        class="loading loading-spinner loading-xs ml-2"
      />
      <Icon v-else name="tabler:brand-github" size="24" />
    </button>

    <!-- Sign out button for authenticated users -->
    <button v-else class="btn btn-secondary" @click="authStore.signOut()">
      Sign out
    </button>
  </div>
</template>
