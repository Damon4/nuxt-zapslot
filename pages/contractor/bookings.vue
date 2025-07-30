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
      <button class="btn btn-outline" @click="fetchContractorBookings()">
        <Icon name="tabler:refresh" class="h-4 w-4" />
        Refresh
      </button>
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
        <div class="stat-desc">Orders</div>
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

    <!-- Enhanced Bookings Table -->
    <ContractorBookingsTable
      :bookings="filteredBookings"
      :loading="isLoading"
      @update-status="updateBookingStatus"
      @bulk-action="handleBulkAction"
      @refresh="fetchContractorBookings"
    />

    <!-- Empty State -->
    <div v-if="!isLoading && bookings.length === 0" class="py-12 text-center">
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

const handleBulkAction = async (bookingIds: number[], action: string) => {
  try {
    const response = await $fetch('/api/contractor/bookings/bulk-action', {
      method: 'POST',
      body: {
        bookingIds,
        action,
      },
    })

    showSuccess('Bulk Action Successful', response.message)
    await fetchContractorBookings()
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    showError(
      'Bulk Action Failed',
      errorData.data?.message || 'Failed to perform bulk action'
    )
  }
}

// Load data on mount
onMounted(() => {
  fetchContractorBookings()
})
</script>
