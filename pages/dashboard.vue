<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

// Authentication check - now protected by server-side middleware
const session = authClient.useSession()
const user = computed(() => session.value?.data?.user)

// Page metadata
useHead({
  title: 'Dashboard - ZapSlot',
  meta: [{ name: 'description', content: 'Your ZapSlot dashboard' }],
})

// Loading state
const isLoading = computed(() => session.value?.isPending ?? false)
</script>

<template>
  <div class="bg-base-100 min-h-screen">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Dashboard content -->
    <div v-else-if="user" class="container mx-auto max-w-6xl px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-base-content mb-2 text-3xl font-bold">
          Welcome back, {{ user.name }}!
        </h1>
        <p class="text-base-content/70">
          Here's what's happening with your account
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="stat bg-base-200 rounded-lg shadow">
          <div class="stat-figure text-primary">
            <Icon name="tabler:user-check" size="32" />
          </div>
          <div class="stat-title">Account Status</div>
          <div class="stat-value text-primary">Active</div>
          <div class="stat-desc">
            Since {{ new Date(user.createdAt).toLocaleDateString() }}
          </div>
        </div>

        <div class="stat bg-base-200 rounded-lg shadow">
          <div class="stat-figure text-secondary">
            <Icon name="tabler:mail-check" size="32" />
          </div>
          <div class="stat-title">Email Status</div>
          <div class="stat-value text-secondary">
            {{ user.emailVerified ? 'Verified' : 'Pending' }}
          </div>
          <div class="stat-desc">{{ user.email }}</div>
        </div>

        <div class="stat bg-base-200 rounded-lg shadow">
          <div class="stat-figure text-accent">
            <Icon name="tabler:shield-check" size="32" />
          </div>
          <div class="stat-title">Security</div>
          <div class="stat-value text-accent">Secure</div>
          <div class="stat-desc">GitHub OAuth</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Profile Quick View -->
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">
              <Icon name="tabler:user-circle" size="24" />
              Profile Overview
            </h2>

            <div class="mb-4 flex items-center gap-4">
              <div class="avatar">
                <div class="h-16 w-16 rounded-full">
                  <img
                    :src="user.image || '/logo.png'"
                    :alt="user.name"
                    class="object-cover"
                  >
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold">{{ user.name }}</h3>
                <p class="text-base-content/70">{{ user.email }}</p>
              </div>
            </div>

            <div class="card-actions justify-end">
              <NuxtLink to="/profile" class="btn btn-primary">
                <Icon name="tabler:edit" size="16" />
                Edit Profile
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">
              <Icon name="tabler:clock-hour-4" size="24" />
              Recent Activity
            </h2>

            <div class="space-y-3">
              <div class="bg-base-100 flex items-center gap-3 rounded-lg p-3">
                <div class="badge badge-success badge-sm" />
                <span class="flex-1">Account created</span>
                <span class="text-base-content/70 text-xs">
                  {{ new Date(user.createdAt).toLocaleDateString() }}
                </span>
              </div>

              <div class="bg-base-100 flex items-center gap-3 rounded-lg p-3">
                <div class="badge badge-info badge-sm" />
                <span class="flex-1">Profile updated</span>
                <span class="text-base-content/70 text-xs">
                  {{ new Date(user.updatedAt).toLocaleDateString() }}
                </span>
              </div>

              <div class="bg-base-100 flex items-center gap-3 rounded-lg p-3">
                <div class="badge badge-primary badge-sm" />
                <span class="flex-1">Signed in with GitHub</span>
                <span class="text-base-content/70 text-xs">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not authenticated state -->
    <div v-else class="flex min-h-screen items-center justify-center">
      <div class="text-center">
        <h1 class="mb-4 text-2xl font-bold">Access Denied</h1>
        <p class="text-base-content/70 mb-6">
          You need to sign in to view your dashboard.
        </p>
        <NuxtLink to="/" class="btn btn-primary"> Go Home </NuxtLink>
      </div>
    </div>
  </div>
</template>
