<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

// Use Pinia store for auth state
const authStore = useAuthStore()

// Reactive getters from store
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div>
    <!-- Sign in button for unauthenticated users -->
    <button
      v-if="!isAuthenticated"
      class="btn btn-accent"
      @click="
        () =>
          authClient.signIn.social({
            provider: 'github',
            callbackURL: '/dashboard',
          })
      "
    >
      Sign in with GitHub
      <Icon name="tabler:brand-github" size="24" />
    </button>

    <!-- Sign out button for authenticated users -->
    <button v-else class="btn btn-secondary" @click="authStore.signOut()">
      Sign out
    </button>
  </div>
</template>
