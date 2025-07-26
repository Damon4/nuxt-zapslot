<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotifications } from '~/composables/useNotifications'

const authStore = useAuthStore()
const user = authStore.user
const { success, error } = useNotifications()

// Page metadata
useHead({
  title: 'Profile - ZapSlot',
  meta: [
    { name: 'description', content: 'Manage your ZapSlot profile settings' },
  ],
})

// Loading state
const isLoading = authStore.loading

// Profile editing state
const isEditing = ref(false)
const isUpdating = ref(false)
const editForm = ref({
  name: '',
  email: '',
})

// Form validation state
const formErrors = ref({
  name: '',
  email: '',
})

// Initialize edit form when user data is available
watch(
  () => user,
  (newUser) => {
    if (newUser) {
      editForm.value = {
        name: newUser.name || '',
        email: newUser.email || '',
      }
    }
  },
  { immediate: true }
)

// Validation functions
const validateForm = () => {
  let isValid = true
  formErrors.value = { name: '', email: '' }

  // Validate name
  if (!editForm.value.name.trim()) {
    formErrors.value.name = 'Name is required'
    isValid = false
  } else if (editForm.value.name.trim().length < 2) {
    formErrors.value.name = 'Name must be at least 2 characters'
    isValid = false
  } else if (editForm.value.name.trim().length > 100) {
    formErrors.value.name = 'Name must be less than 100 characters'
    isValid = false
  }

  // Email validation removed - email cannot be changed

  return isValid
}

// Update profile function
const updateProfile = async () => {
  if (isUpdating.value) return

  // Validate form before sending
  if (!validateForm()) {
    return
  }

  isUpdating.value = true

  try {
    const response = await $fetch('/api/user/profile', {
      method: 'PATCH',
      body: {
        name: editForm.value.name.trim(),
      },
    })

    if (response.success) {
      // Refresh session to get updated user data
      await authStore.refreshSession()

      isEditing.value = false

      // Show success message
      success('Profile Updated', 'Your profile has been successfully updated!')
    }
  } catch (err: unknown) {
    // Handle different types of errors
    let errorMessage = 'Failed to update profile. Please try again.'

    if (err && typeof err === 'object') {
      if (
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'statusMessage' in err.data
      ) {
        errorMessage = String(err.data.statusMessage)
      } else if ('statusMessage' in err) {
        errorMessage = String(err.statusMessage)
      } else if ('message' in err) {
        errorMessage = String(err.message)
      }
    }

    error('Update Failed', errorMessage)
  } finally {
    isUpdating.value = false
  }
}

const cancelEdit = () => {
  if (user) {
    editForm.value = {
      name: user.name || '',
      email: user.email || '',
    }
  }
  formErrors.value = { name: '', email: '' }
  isEditing.value = false
}

// Clear errors when user starts typing
watch(
  () => editForm.value.name,
  () => {
    if (formErrors.value.name) {
      formErrors.value.name = ''
    }
  }
)

watch(
  () => editForm.value.email,
  () => {
    if (formErrors.value.email) {
      formErrors.value.email = ''
    }
  }
)

// Format date helper
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="bg-base-100 min-h-screen">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Profile content -->
    <div v-else-if="user" class="container mx-auto max-w-4xl px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-base-content mb-2 text-3xl font-bold">Profile</h1>
        <p class="text-base-content/70">
          Manage your account settings and preferences
        </p>
      </div>

      <!-- Profile Card -->
      <div class="card bg-base-200 mb-6 shadow-xl">
        <div class="card-body">
          <!-- Profile Header -->
          <div
            class="mb-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center"
          >
            <!-- Avatar -->
            <div class="avatar">
              <div
                class="ring-primary ring-offset-base-100 h-24 w-24 rounded-full ring ring-offset-2"
              >
                <img
                  :src="user.image || '/logo.png'"
                  :alt="user.name || 'User avatar'"
                  class="object-cover"
                >
              </div>
            </div>

            <!-- User Info -->
            <div class="flex-1">
              <h2 class="text-base-content mb-1 text-2xl font-bold">
                {{ user.name || 'Anonymous User' }}
              </h2>
              <p class="text-base-content/70 mb-2">{{ user.email }}</p>
              <div class="badge badge-primary">
                Member since {{ formatDate(user.createdAt) }}
              </div>
            </div>

            <!-- Edit Button -->
            <div class="flex gap-2">
              <button
                v-if="!isEditing"
                class="btn btn-primary"
                @click="isEditing = true"
              >
                <Icon name="tabler:edit" size="20" />
                Edit Profile
              </button>
            </div>
          </div>

          <!-- Edit Form -->
          <div v-if="isEditing" class="border-base-300 border-t pt-6">
            <h3 class="mb-4 text-lg font-semibold">Edit Profile Information</h3>

            <form class="space-y-4" @submit.prevent="updateProfile">
              <!-- Name Field -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Name</span>
                </label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="input input-bordered w-full"
                  :class="{
                    'input-disabled': isUpdating,
                    'input-error': formErrors.name,
                  }"
                  placeholder="Enter your name"
                  :disabled="isUpdating"
                  required
                >
                <label v-if="formErrors.name" class="label">
                  <span class="label-text-alt text-error">{{
                    formErrors.name
                  }}</span>
                </label>
              </div>

              <!-- Email Field (Read Only) -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Email</span>
                </label>
                <input
                  v-model="editForm.email"
                  type="email"
                  class="input input-bordered input-disabled w-full"
                  placeholder="Enter your email"
                  disabled
                  readonly
                >
                <label class="label">
                  <span class="label-text-alt text-info"
                    >Email cannot be changed</span
                  >
                </label>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 pt-4">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :class="{ loading: isUpdating }"
                  :disabled="isUpdating || !editForm.name.trim()"
                >
                  <Icon v-if="!isUpdating" name="tabler:check" size="20" />
                  {{ isUpdating ? 'Saving...' : 'Save Changes' }}
                </button>
                <button
                  type="button"
                  class="btn btn-ghost"
                  :disabled="isUpdating"
                  @click="cancelEdit"
                >
                  <Icon name="tabler:x" size="20" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Account Information -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Account Details -->
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h3 class="card-title mb-4 text-lg">
              <Icon name="tabler:user-circle" size="24" />
              Account Details
            </h3>

            <div class="space-y-3">
              <div
                class="border-base-300 flex items-center justify-between border-b py-2"
              >
                <span class="text-base-content/70">User ID</span>
                <span class="font-mono text-sm">{{ user.id }}</span>
              </div>

              <div
                class="border-base-300 flex items-center justify-between border-b py-2"
              >
                <span class="text-base-content/70">Email Verified</span>
                <div
                  class="badge"
                  :class="
                    user.emailVerified ? 'badge-success' : 'badge-warning'
                  "
                >
                  {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                </div>
              </div>

              <div
                class="border-base-300 flex items-center justify-between border-b py-2"
              >
                <span class="text-base-content/70">Account Created</span>
                <span>{{ formatDate(user.createdAt) }}</span>
              </div>

              <div class="flex items-center justify-between py-2">
                <span class="text-base-content/70">Last Updated</span>
                <span>{{ formatDate(user.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h3 class="card-title mb-4 text-lg">
              <Icon name="tabler:shield-check" size="24" />
              Security
            </h3>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">GitHub Account</p>
                  <p class="text-base-content/70 text-sm">
                    Connected via GitHub OAuth
                  </p>
                </div>
                <div class="badge badge-success">Connected</div>
              </div>

              <div class="divider" />

              <button
                class="btn btn-outline btn-error w-full"
                @click="authStore.signOut()"
              >
                <Icon name="tabler:logout" size="20" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card bg-error/10 border-error/20 mt-6 border shadow-xl">
        <div class="card-body">
          <h3 class="card-title text-error mb-4 text-lg">
            <Icon name="tabler:alert-triangle" size="24" />
            Danger Zone
          </h3>

          <p class="text-base-content/70 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>

          <button class="btn btn-error btn-outline">
            <Icon name="tabler:trash" size="20" />
            Delete Account
          </button>
        </div>
      </div>
    </div>

    <!-- Not authenticated state -->
    <div v-else class="flex min-h-screen items-center justify-center">
      <div class="text-center">
        <h1 class="mb-4 text-2xl font-bold">Access Denied</h1>
        <p class="text-base-content/70 mb-6">
          You need to sign in to view your profile.
        </p>
        <NuxtLink to="/" class="btn btn-primary"> Go Home </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
