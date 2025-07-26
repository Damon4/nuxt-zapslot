<script setup lang="ts">
import { NuxtLink } from '#components'
import AuthButton from '~/components/app/AuthButton.vue'
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

const user = computed(() => {
  if (!isHydrated.value) return null
  return serverAuthData.value?.user || null
})
</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <NuxtLink class="btn btn-ghost text-xl">
        <img src="/logo.svg" width="40" alt="Discover Nuxt" >
        ZapSlot
      </NuxtLink>
    </div>
    <div class="navbar-end">
      <!-- Placeholder during SSR/hydration -->
      <div v-if="!isHydrated" class="btn btn-accent">Sign in with GitHub</div>

      <!-- Actual auth state after hydration -->
      <template v-else>
        <!-- Authenticated user dropdown -->
        <div v-if="isAuthenticated && user" class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-circle avatar"
          >
            <div class="w-10 rounded-full">
              <img alt="User avatar" :src="(user as any)?.image ?? undefined" >
            </div>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <NuxtLink to="/dashboard">Dashboard</NuxtLink>
            </li>
            <hr class="my-2" >
            <li>
              <button @click="authClient.signOut()">Logout</button>
            </li>
          </ul>
        </div>

        <!-- Unauthenticated user - show auth button -->
        <AuthButton v-else />
      </template>

      <AppThemeToggle class="ml-4" />
    </div>
  </div>
</template>
