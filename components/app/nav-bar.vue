<script setup lang="ts">
import { NuxtLink } from '#components'
</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <NuxtLink class="btn btn-ghost text-xl">ZapSlot</NuxtLink>
    </div>
    <div class="navbar-end">
      <AppThemeToggle class="mr-4" />
      <NuxtLink class="btn btn-accent">
        Sign in with GitHub <Icon name="tabler:brand-github" size="24" />
      </NuxtLink>
    </div>
  </div>
</template>
