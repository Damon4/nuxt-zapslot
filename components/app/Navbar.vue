<script setup lang="ts">
import { NuxtLink } from '#components'
import AuthButton from '~/components/app/AuthButton.vue'
import { authClient } from '~/lib/auth-client'
const session = authClient.useSession()
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
      <div v-if="session?.data" class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img
              alt="User avatar"
              :src="session.data.user?.image ?? undefined"
            >
          </div>
        </div>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
        >
          <li>
            <button @click="authClient.signOut()">Logout</button>
          </li>
        </ul>
      </div>
      <AuthButton v-if="!session?.data" />
      <AppThemeToggle class="ml-4" />
    </div>
  </div>
</template>
