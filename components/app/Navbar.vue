<script setup lang="ts">
import AuthButton from '~/components/app/AuthButton.vue'

// Use Pinia store for auth state
const authStore = useAuthStore()
</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <NuxtLink
        class="btn btn-ghost text-xl"
        :to="authStore.isAuthenticated ? '/dashboard' : '/'"
      >
        <img src="/logo.svg" width="40" alt="Discover Nuxt" >
        ZapSlot
      </NuxtLink>
    </div>
    <div class="navbar-end">
      <!-- Authenticated user dropdown -->
      <div
        v-if="authStore.isAuthenticated && authStore?.user"
        class="dropdown dropdown-end"
      >
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img alt="User avatar" :src="authStore.user.image ?? undefined" >
          </div>
        </div>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
        >
          <li>
            <NuxtLink to="/dashboard">Dashboard</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/profile">Profile</NuxtLink>
          </li>
          <hr class="my-2" >
          <li>
            <button @click="authStore.signOut()">Logout</button>
          </li>
        </ul>
      </div>

      <!-- Unauthenticated user - show auth button -->
      <AuthButton v-else />

      <AppThemeToggle class="ml-4" />
    </div>
  </div>
</template>
