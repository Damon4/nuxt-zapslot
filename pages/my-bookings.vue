<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Composables
const { bookings, isLoading, error, fetchUserBookings, cancelBooking } =
  useBookings()

const { success, error: showError } = useNotifications()

// Page metadata
definePageMeta({
  title: 'My Bookings',
  description: 'View and manage your service bookings',
})

useHead({
  title: 'My Bookings - ZapSlot',
  meta: [
    { name: 'description', content: 'View and manage your service bookings' },
  ],
})

// Local state
const statusFilter = ref('all')
const sortBy = ref<'date' | 'status' | 'service'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Computed
const filteredBookings = computed(() => {
  let filtered = [...bookings.value]

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(
      (booking) => booking.status === statusFilter.value
    )
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0

    switch (sortBy.value) {
      case 'date':
        comparison =
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'service':
        comparison = (a.service?.title || '').localeCompare(
          b.service?.title || ''
        )
        break
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return filtered
})

const bookingStats = computed(() => {
  const stats = {
    total: bookings.value.length,
    pending: bookings.value.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.value.filter((b) => b.status === 'CONFIRMED').length,
    completed: bookings.value.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.value.filter((b) => b.status === 'CANCELLED').length,
  }
  return stats
})

// Methods
const handleCancelBooking = async (bookingId: number) => {
  try {
    await cancelBooking(bookingId)
    success(
      'Booking Cancelled',
      'Your booking has been successfully cancelled.'
    )
  } catch {
    showError(
      'Cancellation Failed',
      'Failed to cancel booking. Please try again.'
    )
  }
}

const handleContactContractor = (_bookingId: number) => {
  // TODO: Implement contact contractor functionality
  showError(
    'Feature Coming Soon',
    'Contact contractor feature will be available soon.'
  )
}

const handleViewDetails = (bookingId: number) => {
  // Navigate to booking details
  navigateTo(`/my-bookings/${bookingId}`)
}

const setSortBy = (field: 'date' | 'status' | 'service') => {
  if (sortBy.value === field) {
    // Toggle sort order if same field
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

// Lifecycle
onMounted(() => {
  fetchUserBookings()
})
</script>

<template>
  <div class="bg-base-100 min-h-screen">
    <div class="container mx-auto max-w-6xl px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h1 class="text-base-content mb-2 text-3xl font-bold">
              My Bookings
            </h1>
            <p class="text-base-content/70">
              View and manage all your service bookings
            </p>
          </div>
          <NuxtLink to="/services" class="btn btn-primary">
            <Icon name="tabler:plus" class="h-4 w-4" />
            Book New Service
          </NuxtLink>
        </div>

        <!-- Breadcrumb -->
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/dashboard">Dashboard</NuxtLink></li>
            <li>My Bookings</li>
          </ul>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error mb-8">
        <Icon name="tabler:exclamation-circle" class="h-5 w-5" />
        <span>{{ error }}</span>
        <button class="btn btn-sm btn-outline" @click="fetchUserBookings()">
          Try Again
        </button>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div class="stat bg-base-200 rounded-lg p-4">
            <div class="stat-title text-xs">Total Bookings</div>
            <div class="stat-value text-lg">{{ bookingStats.total }}</div>
          </div>
          <div class="stat bg-base-200 rounded-lg p-4">
            <div class="stat-title text-xs">Pending</div>
            <div class="stat-value text-warning text-lg">
              {{ bookingStats.pending }}
            </div>
          </div>
          <div class="stat bg-base-200 rounded-lg p-4">
            <div class="stat-title text-xs">Confirmed</div>
            <div class="stat-value text-success text-lg">
              {{ bookingStats.confirmed }}
            </div>
          </div>
          <div class="stat bg-base-200 rounded-lg p-4">
            <div class="stat-title text-xs">Completed</div>
            <div class="stat-value text-info text-lg">
              {{ bookingStats.completed }}
            </div>
          </div>
          <div class="stat bg-base-200 rounded-lg p-4">
            <div class="stat-title text-xs">Cancelled</div>
            <div class="stat-value text-error text-lg">
              {{ bookingStats.cancelled }}
            </div>
          </div>
        </div>

        <!-- Filters and Sort -->
        <div class="card bg-base-200 mb-6 shadow-lg">
          <div class="card-body">
            <div class="flex flex-wrap items-center gap-4">
              <!-- Status Filter -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Filter by Status</span>
                </label>
                <select
                  v-model="statusFilter"
                  class="select select-sm select-bordered"
                >
                  <option value="all">All Bookings</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <!-- Sort Controls -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Sort by</span>
                </label>
                <div class="join">
                  <button
                    :class="[
                      'btn btn-sm join-item',
                      sortBy === 'date' ? 'btn-active' : '',
                    ]"
                    @click="setSortBy('date')"
                  >
                    Date
                    <Icon
                      :name="
                        sortBy === 'date' && sortOrder === 'asc'
                          ? 'tabler:arrow-up'
                          : 'tabler:arrow-down'
                      "
                      class="h-3 w-3"
                    />
                  </button>
                  <button
                    :class="[
                      'btn btn-sm join-item',
                      sortBy === 'status' ? 'btn-active' : '',
                    ]"
                    @click="setSortBy('status')"
                  >
                    Status
                    <Icon
                      :name="
                        sortBy === 'status' && sortOrder === 'asc'
                          ? 'tabler:arrow-up'
                          : 'tabler:arrow-down'
                      "
                      class="h-3 w-3"
                    />
                  </button>
                  <button
                    :class="[
                      'btn btn-sm join-item',
                      sortBy === 'service' ? 'btn-active' : '',
                    ]"
                    @click="setSortBy('service')"
                  >
                    Service
                    <Icon
                      :name="
                        sortBy === 'service' && sortOrder === 'asc'
                          ? 'tabler:arrow-up'
                          : 'tabler:arrow-down'
                      "
                      class="h-3 w-3"
                    />
                  </button>
                </div>
              </div>

              <!-- Results count -->
              <div class="ml-auto">
                <div class="badge badge-outline">
                  {{ filteredBookings.length }} result{{
                    filteredBookings.length !== 1 ? 's' : ''
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="bookings.length === 0" class="py-12 text-center">
          <div class="mb-4">
            <Icon
              name="tabler:calendar-off"
              class="text-base-content/30 mx-auto h-16 w-16"
            />
          </div>
          <h3 class="mb-2 text-lg font-semibold">No Bookings Yet</h3>
          <p class="text-base-content/70 mb-4">
            You haven't made any bookings yet. Explore our services to get
            started!
          </p>
          <NuxtLink to="/services" class="btn btn-primary">
            <Icon name="tabler:search" class="h-4 w-4" />
            Browse Services
          </NuxtLink>
        </div>

        <!-- Bookings List -->
        <div
          v-else-if="filteredBookings.length === 0"
          class="py-12 text-center"
        >
          <div class="mb-4">
            <Icon
              name="tabler:filter-off"
              class="text-base-content/30 mx-auto h-16 w-16"
            />
          </div>
          <h3 class="mb-2 text-lg font-semibold">No Results Found</h3>
          <p class="text-base-content/70 mb-4">
            No bookings match your current filter criteria.
          </p>
          <button class="btn btn-outline" @click="statusFilter = 'all'">
            Clear Filters
          </button>
        </div>

        <div v-else class="space-y-6">
          <BookingCard
            v-for="booking in filteredBookings"
            :key="booking.id"
            :booking="booking"
            @cancel="handleCancelBooking"
            @contact="handleContactContractor"
            @view-details="handleViewDetails"
          />
        </div>
      </div>
    </div>
  </div>
</template>
