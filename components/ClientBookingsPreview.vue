<script setup lang="ts">
import { onMounted } from 'vue'

// Composables
const {
  bookings,
  isLoading,
  error,
  fetchUserBookings,
  getUpcomingBookings,
  cancelBooking,
} = useBookings()

const { success, error: showError } = useNotifications()

// Get only recent bookings for preview (max 3)
const recentBookings = computed(() => {
  return bookings.value
    .slice(0, 3)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
})

const upcomingBookings = getUpcomingBookings()

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

// Lifecycle
onMounted(() => {
  fetchUserBookings()
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <Icon name="tabler:exclamation-circle" class="h-5 w-5" />
      <span>{{ error }}</span>
      <button class="btn btn-sm btn-outline" @click="fetchUserBookings()">
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="bookings.length === 0" class="py-12 text-center">
      <div class="mb-4">
        <Icon
          name="tabler:calendar-off"
          class="text-base-content/30 mx-auto h-16 w-16"
        />
      </div>
      <h3 class="mb-2 text-lg font-semibold">No Bookings Yet</h3>
      <p class="text-base-content/70 mb-4">
        You haven't made any bookings yet. Explore our services to get started!
      </p>
      <NuxtLink to="/services" class="btn btn-primary">
        <Icon name="tabler:search" class="h-4 w-4" />
        Browse Services
      </NuxtLink>
    </div>

    <!-- Bookings Content -->
    <div v-else>
      <!-- Quick Stats -->
      <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="stat bg-base-200 rounded-lg p-4">
          <div class="stat-title text-xs">Total</div>
          <div class="stat-value text-lg">{{ bookings.length }}</div>
        </div>
        <div class="stat bg-base-200 rounded-lg p-4">
          <div class="stat-title text-xs">Upcoming</div>
          <div class="stat-value text-warning text-lg">
            {{ upcomingBookings.length }}
          </div>
        </div>
        <div class="stat bg-base-200 rounded-lg p-4">
          <div class="stat-title text-xs">Pending</div>
          <div class="stat-value text-warning text-lg">
            {{ bookings.filter((b) => b.status === 'PENDING').length }}
          </div>
        </div>
        <div class="stat bg-base-200 rounded-lg p-4">
          <div class="stat-title text-xs">Completed</div>
          <div class="stat-value text-success text-lg">
            {{ bookings.filter((b) => b.status === 'COMPLETED').length }}
          </div>
        </div>
      </div>

      <!-- Recent Bookings -->
      <div class="space-y-4">
        <BookingCard
          v-for="booking in recentBookings"
          :key="booking.id"
          :booking="booking"
          @cancel="handleCancelBooking"
          @contact="handleContactContractor"
          @view-details="handleViewDetails"
        />
      </div>

      <!-- Show More Link -->
      <div v-if="bookings.length > 3" class="mt-6 text-center">
        <NuxtLink to="/my-bookings" class="btn btn-outline">
          <Icon name="tabler:arrow-right" class="h-4 w-4" />
          View All {{ bookings.length }} Bookings
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
