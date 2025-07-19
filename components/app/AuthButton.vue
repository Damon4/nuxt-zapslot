<script setup lang="ts">
import { authClient } from '~/lib/auth-client'
const session = authClient.useSession()
</script>

<template>
  <button
    v-if="!session?.data"
    class="btn btn-accent"
    @click="() => authClient.signIn.social({ provider: 'github' })"
  >
    Sign in with GitHub
    <Icon name="tabler:brand-github" size="24" />
  </button>
  <div v-else>
    <button class="btn btn-secondary" @click="authClient.signOut()">
      Sign out
    </button>
  </div>
</template>
