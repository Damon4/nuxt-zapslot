<script setup lang="ts">
import { NuxtLink } from '#components'
import AuthButton from '~/components/app/AuthButton.vue'
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
      <AuthButton />
      <AppThemeToggle class="ml-4" />
    </div>
  </div>
</template>
