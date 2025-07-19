<script setup lang="ts">
import { AppNavbar } from '#components'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />
    <main>
      <slot />
    </main>
  </div>
</template>
