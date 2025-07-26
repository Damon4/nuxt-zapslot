<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

// Use Pinia store for auth state
const authStore = useAuthStore()

// Reactive getters from store
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isLoading = computed(() => authStore.isLoading)
</script>

<template>
  <div>
    <!-- Sign in button for unauthenticated users -->
    <button
      v-if="!isAuthenticated"
      class="btn btn-accent"
      :disabled="isLoading"
      @click="
        () =>
          authClient.signIn.social({
            provider: 'github',
            callbackURL: '/dashboard',
          })
      "
    >
      Sign in with GitHub
      <span v-if="isLoading" class="loading loading-spinner loading-xs ml-2" />
      <Icon v-else name="tabler:brand-github" size="24" />
    </button>

    <!-- Sign out button for authenticated users -->
    <button v-else class="btn btn-secondary" @click="authStore.signOut()">
      Sign out
    </button>
  </div>
</template>
