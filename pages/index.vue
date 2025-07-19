<script setup lang="ts">
import { authClient } from '~/lib/auth-client'
const session = authClient.useSession()
</script>

<template>
  <div class="hero bg-base-200 container mx-auto min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">ZapSlot</h1>
        <p class="py-6">
          Welcome! Here you can easily book an appointment for the service you
          need. Simply choose your desired service, select a convenient time,
          and fill out the form. We will contact you to confirm your booking.
          Fast, easy, and no unnecessary calls!
        </p>
        <button
          v-if="!session?.data"
          class="btn btn-accent"
          @click="() => authClient.signIn.social({ provider: 'github' })"
        >
          Sign in with GitHub
          <Icon name="tabler:brand-github" size="24" />
        </button>
        <div v-if="session?.data">
          <pre>{{ session.data }}</pre>
          <button class="btn btn-secondary" @click="authClient.signOut()">
            Sign out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
