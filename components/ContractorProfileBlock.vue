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

        <!-- Profile information -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="label">
              <span class="label-text font-semibold">Phone</span>
            </label>
            <p class="text-sm">{{ contractor.phone || 'Not provided' }}</p>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-semibold">Website</span>
            </label>
            <p class="text-sm">{{ contractor.website || 'Not provided' }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="label">
              <span class="label-text font-semibold">Description</span>
            </label>
            <p class="text-sm">
              {{ contractor.description || 'No description provided' }}
            </p>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-semibold">Experience</span>
            </label>
            <p class="text-sm">{{ contractor.experience || 'Not provided' }}</p>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-semibold">Service Categories</span>
            </label>
            <p class="text-sm">
              {{ contractor.categories || 'Not specified' }}
            </p>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="card-actions mt-6 justify-end">
          <button class="btn btn-outline" @click="openEditForm">
            <Icon name="tabler:edit" size="16" />
            Edit Contractor Profile
          </button>
          <button class="btn btn-error" @click="openDeleteModal">
            <Icon name="tabler:trash" size="16" />
            Delete Contractor Profile
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Application Modal -->
  <ContractorApplicationModal
    v-if="showApplicationModal"
    :show="showApplicationModal"
    @close="closeApplicationForm"
    @success="onApplicationSuccess"
  />

  <!-- Edit Modal -->
  <ContractorEditModal
    v-if="showEditModal && contractor"
    :show="showEditModal"
    :contractor="contractor"
    @close="closeEditForm"
    @success="onEditSuccess"
  />

  <!-- Delete Confirmation Modal -->
  <dialog ref="deleteModal" class="modal">
    <div class="modal-box">
      <h3 class="text-error text-lg font-bold">Delete Contractor Profile</h3>
      <div class="py-4">
        <div class="alert alert-error mb-4">
          <Icon name="tabler:alert-triangle" />
          <span class="font-semibold">This action cannot be undone!</span>
        </div>

        <p class="mb-4 text-sm">This will permanently delete:</p>

        <ul
          class="text-base-content/70 mb-4 list-inside list-disc space-y-1 text-sm"
        >
          <li>Your entire contractor profile</li>
          <li>All your services and listings</li>
          <li>Your service provider status</li>
          <li>All associated contractor data</li>
        </ul>

        <p class="text-sm font-semibold">
          You will need to reapply if you want to become a contractor again.
        </p>
      </div>

      <div class="modal-action">
        <button
          class="btn btn-outline"
          :disabled="deleting"
          @click="closeDeleteModal"
        >
          Cancel
        </button>
        <button
          class="btn btn-error"
          :disabled="deleting"
          @click="deleteContractor"
        >
          <span v-if="deleting" class="loading loading-spinner loading-sm" />
          {{ deleting ? 'Deleting...' : 'Yes, Delete Everything' }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="closeDeleteModal">close</button>
    </form>
  </dialog>
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
const deleting = ref(false)
const deleteModal = ref<HTMLDialogElement | null>(null)

// Computed properties
const statusClass = computed(() => {
  if (!contractor.value) return ''

  switch (contractor.value.status) {
    case 1:
      return 'alert-success'
    case 3:
      return 'alert-error'
    default:
      return 'alert-info'
  }
})

const statusText = computed(() => {
  if (!contractor.value) return ''

  switch (contractor.value.status) {
    case 1:
      return 'Application approved - you are now a service provider!'
    case 3:
      return 'Contractor status suspended'
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

// Deletion functions
const openDeleteModal = () => {
  deleteModal.value?.showModal()
}

const closeDeleteModal = () => {
  deleteModal.value?.close()
}

const deleteContractor = async () => {
  if (!contractor.value) return

  try {
    deleting.value = true

    const response = (await $fetch('/api/contractor/delete', {
      method: 'POST',
    })) as unknown as { success: boolean; deletedServices?: number }

    if (response.success) {
      success(
        `Contractor profile deleted. ${response.deletedServices || 0} services were removed.`
      )
      // Reset contractor data to null to show the application form
      contractor.value = null
      closeDeleteModal()
    }
  } catch (err: unknown) {
    console.error('Error deleting contractor:', err)
    const errorMessage =
      err &&
      typeof err === 'object' &&
      'data' in err &&
      err.data &&
      typeof err.data === 'object' &&
      'message' in err.data
        ? (err.data as { message?: string }).message ||
          'Failed to delete contractor profile'
        : 'Failed to delete contractor profile'
    error(errorMessage)
  } finally {
    deleting.value = false
  }
}

// Load contractor profile on mount
onMounted(() => {
  fetchContractorProfile()
})
</script>
