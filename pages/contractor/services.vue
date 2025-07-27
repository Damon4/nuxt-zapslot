<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-base-content text-3xl font-bold">My Services</h1>
        <p class="text-base-content/70 mt-2">
          Manage your service offerings and track bookings
        </p>
      </div>
      <button class="btn btn-primary" @click="showCreateForm = true">
        <svg
          class="mr-2 h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add Service
      </button>
    </div>

    <!-- Statistics Cards -->
    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Total Services</div>
        <div class="stat-value text-primary">{{ services.length }}</div>
        <div class="stat-desc">{{ activeServices }} active</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Total Bookings</div>
        <div class="stat-value text-secondary">{{ totalBookings }}</div>
        <div class="stat-desc">All time</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Pending Orders</div>
        <div class="stat-value text-warning">{{ pendingBookings }}</div>
        <div class="stat-desc">Need attention</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">This Month</div>
        <div class="stat-value text-success">{{ monthlyBookings }}</div>
        <div class="stat-desc">Bookings</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Services List -->
    <div v-else-if="services.length > 0" class="space-y-4">
      <div
        v-for="service in services"
        :key="service.id"
        class="card bg-base-100 shadow-lg transition-shadow hover:shadow-xl"
      >
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="mb-2 flex items-center gap-3">
                <h3 class="card-title text-lg">{{ service.title }}</h3>
                <div class="badge badge-outline">{{ service.category }}</div>
                <div
                  :class="{
                    'badge badge-success': service.isActive,
                    'badge badge-error': !service.isActive,
                  }"
                >
                  {{ service.isActive ? 'Active' : 'Inactive' }}
                </div>
              </div>

              <p class="text-base-content/70 mb-3 line-clamp-2">
                {{ service.description }}
              </p>

              <div class="flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-1">
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <span>{{ formatPrice(service) }}</span>
                </div>

                <div v-if="service.duration" class="flex items-center gap-1">
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{{ service.duration }} min</span>
                </div>

                <div class="flex items-center gap-1">
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{{ formatAvailability(service.availability) }}</span>
                </div>

                <div class="flex items-center gap-1">
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>{{ service.bookingsCount || 0 }} bookings</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="ml-4 flex gap-2">
              <div class="form-control">
                <label class="label cursor-pointer">
                  <input
                    type="checkbox"
                    class="toggle toggle-success"
                    :checked="service.isActive"
                    @change="toggleServiceStatus(service.id, !service.isActive)"
                  >
                </label>
              </div>

              <button
                class="btn btn-ghost btn-sm"
                @click="editService(service)"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              <button
                class="btn btn-ghost btn-sm text-error"
                @click="confirmDelete(service)"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-12 text-center">
      <svg
        class="text-base-content/30 mx-auto mb-4 h-24 w-24"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 class="mb-2 text-xl font-semibold">No services yet</h3>
      <p class="text-base-content/70 mb-6">
        Start by creating your first service offering
      </p>
      <button class="btn btn-primary" @click="showCreateForm = true">
        Create First Service
      </button>
    </div>

    <!-- Service Form Modal -->
    <ServiceForm
      v-if="showCreateForm || editingService"
      :service="editingService"
      @close="closeForm"
      @saved="onServiceSaved"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="serviceToDelete" class="modal modal-open">
      <div class="modal-box">
        <h3 class="mb-4 text-lg font-bold">Delete Service</h3>
        <p class="mb-6">
          Are you sure you want to delete "{{ serviceToDelete.title }}"? This
          action cannot be undone and will cancel all pending bookings.
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="serviceToDelete = null">
            Cancel
          </button>
          <button
            class="btn btn-error"
            :disabled="deleting"
            @click="deleteService"
          >
            <span
              v-if="deleting"
              class="loading loading-spinner loading-sm mr-2"
            />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServices } from '~/composables/useServices'
import { useNotifications } from '~/composables/useNotifications'

// Define page meta
definePageMeta({
  middleware: 'contractor',
  layout: 'default',
})

// Head meta
useHead({
  title: 'My Services - Contractor Dashboard',
})

// Composables
const {
  services,
  isLoading,
  fetchContractorServices,
  toggleService,
  deleteService: removeService,
} = useServices()
const { success: showSuccess, error: showError } = useNotifications()

// Types
interface ServiceData {
  id: number
  title: string
  description: string
  category: string
  price?: number
  priceType: 'FIXED' | 'HOURLY' | 'NEGOTIABLE'
  duration?: number
  availability: string
  isActive: boolean
  bookingsCount?: number
}

// Reactive data
const showCreateForm = ref(false)
const editingService = ref<ServiceData | null>(null)
const serviceToDelete = ref<ServiceData | null>(null)
const deleting = ref(false)

// Computed properties
const activeServices = computed(
  () => services.value.filter((s) => s.isActive).length
)

const totalBookings = computed(() =>
  services.value.reduce((sum, s) => sum + (s.bookingsCount || 0), 0)
)

const pendingBookings = computed(() => {
  // This would need to be fetched from a separate API call
  // For now, returning a placeholder
  return 0
})

const monthlyBookings = computed(() => {
  // This would need to be calculated from booking data
  // For now, returning a placeholder
  return 0
})

// Methods
const formatPrice = (service: ServiceData) => {
  if (service.priceType === 'NEGOTIABLE') {
    return 'Negotiable'
  }
  if (!service.price) {
    return 'Not specified'
  }
  const suffix = service.priceType === 'HOURLY' ? '/hour' : ''
  return `$${service.price}${suffix}`
}

const formatAvailability = (availability: string) => {
  const map: Record<string, string> = {
    WEEKDAYS: 'Weekdays',
    WEEKENDS: 'Weekends',
    MORNINGS: 'Mornings',
    EVENINGS: 'Evenings',
    FLEXIBLE: 'Flexible',
  }
  return map[availability] || availability
}

const editService = (service: ServiceData) => {
  editingService.value = service
}

const closeForm = () => {
  showCreateForm.value = false
  editingService.value = null
}

const onServiceSaved = () => {
  closeForm()
  fetchContractorServices()
  showSuccess('Service saved successfully')
}

const toggleServiceStatus = async (serviceId: number, isActive: boolean) => {
  try {
    await toggleService(serviceId)
    await fetchContractorServices()
    showSuccess(
      `Service ${isActive ? 'activated' : 'deactivated'} successfully`
    )
  } catch {
    showError('Failed to update service status')
  }
}

const confirmDelete = (service: ServiceData) => {
  serviceToDelete.value = service
}

const deleteService = async () => {
  if (!serviceToDelete.value) return

  try {
    deleting.value = true
    await removeService(serviceToDelete.value.id)
    await fetchContractorServices()
    serviceToDelete.value = null
    showSuccess('Service deleted successfully')
  } catch {
    showError('Failed to delete service')
  } finally {
    deleting.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchContractorServices()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
