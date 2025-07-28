<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-base-content text-3xl font-bold">My Bookings</h1>
        <p class="text-base-content/70 mt-2">
          Manage incoming orders and bookings
        </p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Total Bookings</div>
        <div class="stat-value text-primary">{{ bookings.length }}</div>
        <div class="stat-desc">All time</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Pending</div>
        <div class="stat-value text-warning">{{ pendingCount }}</div>
        <div class="stat-desc">Need attention</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Confirmed</div>
        <div class="stat-value text-success">{{ confirmedCount }}</div>
        <div class="stat-desc">Ready to go</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">This Month</div>
        <div class="stat-value text-info">{{ monthlyCount }}</div>
        <div class="stat-desc">Bookings</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-4">
      <select v-model="statusFilter" class="select select-bordered">
        <option value="">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="COMPLETED">Completed</option>
      </select>

      <select v-model="sortBy" class="select select-bordered">
        <option value="scheduledAt">Sort by Date</option>
        <option value="createdAt">Sort by Created</option>
        <option value="status">Sort by Status</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Bookings List -->
    <div v-else-if="filteredBookings.length > 0" class="space-y-4">
      <div
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="card bg-base-100 shadow-lg"
      >
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="mb-3 flex items-center gap-3">
                <h3 class="card-title">
                  {{ booking.service?.title || 'Unknown Service' }}
                </h3>
                <div
                  :class="{
                    'badge badge-warning': booking.status === 'PENDING',
                    'badge badge-success': booking.status === 'CONFIRMED',
                    'badge badge-error': booking.status === 'CANCELLED',
                    'badge badge-info': booking.status === 'COMPLETED',
                  }"
                >
                  {{ booking.status }}
                </div>
              </div>

              <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p class="text-base-content/70 text-sm">Client</p>
                  <p class="font-medium">
                    {{ booking.client?.name || 'Unknown Client' }}
                  </p>
                  <p class="text-base-content/70 text-sm">
                    {{ booking.client?.email || 'No email' }}
                  </p>
                </div>
                <div>
                  <p class="text-base-content/70 text-sm">Scheduled Date</p>
                  <p class="font-medium">
                    {{ formatDate(booking.scheduledAt) }}
                  </p>
                  <p class="text-base-content/70 text-sm">
                    {{ formatTime(booking.scheduledAt) }}
                  </p>
                </div>
              </div>

              <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div v-if="booking.duration">
                  <p class="text-base-content/70 text-sm">Duration</p>
                  <p class="font-medium">{{ booking.duration }} minutes</p>
                </div>
                <div v-if="booking.totalPrice">
                  <p class="text-base-content/70 text-sm">Price</p>
                  <p class="font-medium">${{ booking.totalPrice }}</p>
                </div>
                <div>
                  <p class="text-base-content/70 text-sm">Booked</p>
                  <p class="font-medium">{{ formatDate(booking.createdAt) }}</p>
                </div>
              </div>

              <div v-if="booking.notes" class="mb-4">
                <p class="text-base-content/70 text-sm">Client Notes</p>
                <p class="bg-base-200 rounded p-3 text-sm">
                  {{ booking.notes }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="ml-4 flex flex-col gap-2">
              <div
                v-if="booking.status === 'PENDING'"
                class="flex flex-col gap-2"
              >
                <button
                  class="btn btn-success btn-sm"
                  :disabled="updatingStatus"
                  @click="updateBookingStatus(booking.id, 'CONFIRMED')"
                >
                  <span
                    v-if="updatingStatus"
                    class="loading loading-spinner loading-xs mr-1"
                  />
                  Confirm
                </button>
                <button
                  class="btn btn-error btn-sm"
                  :disabled="updatingStatus"
                  @click="updateBookingStatus(booking.id, 'CANCELLED')"
                >
                  Reject
                </button>
              </div>

              <div
                v-else-if="booking.status === 'CONFIRMED'"
                class="flex flex-col gap-2"
              >
                <button
                  class="btn btn-info btn-sm"
                  :disabled="updatingStatus"
                  @click="updateBookingStatus(booking.id, 'COMPLETED')"
                >
                  Complete
                </button>
                <button
                  class="btn btn-error btn-sm"
                  :disabled="updatingStatus"
                  @click="updateBookingStatus(booking.id, 'CANCELLED')"
                >
                  Cancel
                </button>
              </div>

              <div v-else class="text-base-content/50 text-sm">
                No actions available
              </div>
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
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
      <h3 class="mb-2 text-xl font-semibold">No bookings yet</h3>
      <p class="text-base-content/70 mb-6">
        Bookings will appear here when clients book your services
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookings } from '~/composables/useBookings'
import { useNotifications } from '~/composables/useNotifications'
import { useDateFormat } from '~/composables/useDateFormat'

// Define page meta
definePageMeta({
  // middleware: 'contractor', // Temporarily disabled for testing
  layout: 'default',
})

// Head meta
useHead({
  title: 'My Bookings - Contractor Dashboard',
})

// Composables
const {
  bookings,
  isLoading,
  fetchContractorBookings,
  updateBookingStatus: updateStatus,
} = useBookings()
const { success: showSuccess, error: showError } = useNotifications()
const { formatDate, formatTime } = useDateFormat()

// Reactive data
const statusFilter = ref('')
const sortBy = ref('scheduledAt')
const updatingStatus = ref(false)

// Computed properties
const filteredBookings = computed(() => {
  let filtered = bookings.value

  if (statusFilter.value) {
    filtered = filtered.filter((b) => b.status === statusFilter.value)
  }

  return filtered.sort((a, b) => {
    if (sortBy.value === 'scheduledAt' || sortBy.value === 'createdAt') {
      return (
        new Date(b[sortBy.value]).getTime() -
        new Date(a[sortBy.value]).getTime()
      )
    }

    return 0
  })
})

const pendingCount = computed(
  () => bookings.value.filter((b) => b.status === 'PENDING').length
)

const confirmedCount = computed(
  () => bookings.value.filter((b) => b.status === 'CONFIRMED').length
)

const monthlyCount = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return bookings.value.filter((b) => {
    const bookingDate = new Date(b.createdAt)
    return (
      bookingDate.getMonth() === currentMonth &&
      bookingDate.getFullYear() === currentYear
    )
  }).length
})

// Methods
const updateBookingStatus = async (
  bookingId: number,
  newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
) => {
  try {
    updatingStatus.value = true
    await updateStatus(bookingId, newStatus)
    await fetchContractorBookings()

    const statusMessage =
      {
        CONFIRMED: 'confirmed',
        CANCELLED: 'cancelled',
        COMPLETED: 'marked as completed',
      }[newStatus] || 'updated'

    showSuccess(`Booking ${statusMessage} successfully`)
  } catch {
    showError('Failed to update booking status')
  } finally {
    updatingStatus.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchContractorBookings()
})
</script>
