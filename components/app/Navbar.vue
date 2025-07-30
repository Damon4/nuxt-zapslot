<script setup lang="ts">
import AuthButton from '~/components/app/AuthButton.vue'

// Use Pinia store for auth state
const authStore = useAuthStore()

// Handle dropdown close on navigation
const closeDropdown = () => {
  // Remove focus from dropdown to close it
  const activeElement = document.activeElement as HTMLElement
  if (activeElement && activeElement.blur) {
    activeElement.blur()
  }
}
</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <NuxtLink class="btn btn-ghost text-xl" to="/">
        <img src="/logo.svg" width="24" class="size-6" alt="Discover Nuxt" >
        ZapSlot
      </NuxtLink>
    </div>
    <div class="navbar-center">
      <div class="hidden lg:flex">
        <ul class="menu menu-horizontal px-1 text-lg">
          <li>
            <NuxtLink to="/services" class="btn btn-ghost normal-case">
              Browse Services
            </NuxtLink>
          </li>
          <li v-if="authStore.isAuthenticated">
            <NuxtLink to="/dashboard" class="btn btn-ghost normal-case">
              Dashboard
            </NuxtLink>
          </li>
        </ul>
      </div>
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
            <NuxtLink to="/services" @click="closeDropdown"
              >Browse Services</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/dashboard" @click="closeDropdown"
              >Dashboard</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/profile" @click="closeDropdown">Profile</NuxtLink>
          </li>
          <li v-if="authStore.isAuthenticated">
            <NuxtLink to="/dashboard" @click="closeDropdown"
              >Dashboard</NuxtLink
            >
          </li>
          <ClientOnly>
            <!-- Contractor Panel - only for approved contractors -->
            <li v-if="authStore.isContractor">
              <NuxtLink to="/contractor/services" @click="closeDropdown"
                >My Services</NuxtLink
              >
            </li>
            <li v-if="authStore.isContractor">
              <NuxtLink to="/contractor/bookings" @click="closeDropdown"
                >My Bookings</NuxtLink
              >
            </li>
            <!-- Admin Panel - only for admins -->
            <li v-if="authStore.isAdmin">
              <NuxtLink to="/admin/contractors" @click="closeDropdown"
                >Admin Panel</NuxtLink
              >
            </li>
          </ClientOnly>
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
