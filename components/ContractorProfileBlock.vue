<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-4 text-lg">
        <Icon name="tabler:shield-check" size="24" />
        Service Provider Profile
      </h2>

      <!-- If user hasn't applied yet -->
      <div v-if="!contractor" class="py-8 text-center">
        <p class="text-base-content/70 mb-4">
          Become a service provider and offer your services to clients
        </p>
        <button
          class="btn btn-primary"
          :disabled="isLoading"
          @click="openApplicationForm"
        >
          <span v-if="isLoading" class="loading loading-spinner loading-sm" />
          Become Service Provider
        </button>
      </div>

      <!-- If application submitted -->
      <div v-else class="space-y-4">
        <!-- Application status -->
        <div class="alert" :class="statusClass">
          <svg
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ statusText }}</span>
        </div>

        <!-- Service provider profile information -->
        <div
          v-if="contractor.status === 1"
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div>
            <label class="label">
              <span class="label-text font-semibold">Service Description</span>
            </label>
            <p class="text-sm">{{ contractor.description }}</p>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-semibold">Categories</span>
            </label>
            <p class="text-sm">{{ contractor.categories }}</p>
          </div>

          <div v-if="contractor.experience">
            <label class="label">
              <span class="label-text font-semibold">Work Experience</span>
            </label>
            <p class="text-sm">{{ contractor.experience }}</p>
          </div>

          <div v-if="contractor.portfolio">
            <label class="label">
              <span class="label-text font-semibold">Portfolio</span>
            </label>
            <p class="text-sm">{{ contractor.portfolio }}</p>
          </div>

          <div v-if="contractor.price">
            <label class="label">
              <span class="label-text font-semibold">Service Pricing</span>
            </label>
            <p class="text-sm">{{ contractor.price }}</p>
          </div>
        </div>

        <!-- Action buttons -->
        <div v-if="contractor.status === 1" class="card-actions justify-end">
          <button class="btn btn-outline" @click="openEditForm">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Application form modal -->
  <ContractorApplicationModal
    v-if="showApplicationModal"
    @close="closeApplicationForm"
    @success="onApplicationSuccess"
  />

  <!-- Edit profile modal -->
  <ContractorEditModal
    v-if="showEditModal && contractor"
    :contractor="contractor"
    @close="closeEditForm"
    @success="onEditSuccess"
  />
</template>

<script setup lang="ts">
import type { Contractor } from '@prisma/client'
import { useNotifications } from '~/composables/useNotifications'

const { success, error } = useNotifications()

// Reactive state
const contractor = ref<Contractor | null>(null)
const isLoading = ref(false)
const showApplicationModal = ref(false)
const showEditModal = ref(false)

// Computed properties
const statusClass = computed(() => {
  if (!contractor.value) return ''

  switch (contractor.value.status) {
    case 0:
      return 'alert-warning'
    case 1:
      return 'alert-success'
    case -1:
      return 'alert-error'
    default:
      return 'alert-info'
  }
})

const statusText = computed(() => {
  if (!contractor.value) return ''

  switch (contractor.value.status) {
    case 0:
      return 'Application under review'
    case 1:
      return 'Application approved - you are now a service provider!'
    case -1:
      return 'Application rejected'
    default:
      return 'Unknown status'
  }
})

// Methods
// Load contractor data
const fetchContractorProfile = async () => {
  try {
    isLoading.value = true
    const response = await $fetch<{ data: Contractor | null }>(
      '/api/contractor/profile'
    )
    contractor.value = response.data
  } catch (err: unknown) {
    console.error('Error loading contractor data:', err)
    // If error is not related to missing data, show it
    if (
      err &&
      typeof err === 'object' &&
      'statusCode' in err &&
      err.statusCode !== 404
    ) {
      const errorMessage =
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data
          ? (err.data as { message?: string }).message || 'Error loading data'
          : 'Error loading data'
      error(errorMessage)
    }
  } finally {
    isLoading.value = false
  }
}

const openApplicationForm = () => {
  showApplicationModal.value = true
}

const closeApplicationForm = () => {
  showApplicationModal.value = false
}

const onApplicationSuccess = (newContractor: unknown) => {
  contractor.value = newContractor as Contractor
  closeApplicationForm()
  success('Service provider application submitted successfully!')
}

const openEditForm = () => {
  showEditModal.value = true
}

const closeEditForm = () => {
  showEditModal.value = false
}

const onEditSuccess = (updatedContractor: Contractor) => {
  contractor.value = updatedContractor
  closeEditForm()
  success('Service provider profile updated successfully!')
}

// Load contractor profile on mount
onMounted(() => {
  fetchContractorProfile()
})
</script>
