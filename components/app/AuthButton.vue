<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

// Use a more reliable auth state check
const isHydrated = ref(false)
const serverAuthData = ref<{
  user: Record<string, unknown> | null
  session: Record<string, unknown> | null
} | null>(null)

// Check server auth state after hydration
onMounted(async () => {
  try {
    // Get fresh auth data from server
    const authData = await $fetch('/api/auth/get-session')
    serverAuthData.value = authData
  } catch (error) {
    console.error('Failed to fetch auth state:', error)
    serverAuthData.value = { user: null, session: null }
  }
  isHydrated.value = true
})

// Use server data as source of truth after hydration
const isAuthenticated = computed(() => {
  if (!isHydrated.value) return false
  return !!serverAuthData.value?.user
})
</script>

<template>
  <div>
    <!-- Placeholder during SSR/hydration -->
    <div v-if="!isHydrated" class="btn btn-accent">
      Sign in with GitHub
      <Icon name="tabler:brand-github" size="24" />
    </div>

    <!-- Actual auth state after hydration -->
    <template v-else>
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
      <button v-else class="btn btn-secondary" @click="authClient.signOut()">
        Sign out
      </button>
    </template>
  </div>
</template>
