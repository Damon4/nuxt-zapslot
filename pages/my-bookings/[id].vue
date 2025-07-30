<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// Get booking ID from route
const route = useRoute()
const bookingId = Number(route.params.id)

// Composables
const { cancelBooking } = useBookings()
const { success, error: showError } = useNotifications()

// Define page meta
definePageMeta({
  title: 'Booking Details',
  description: 'View detailed booking information',
})

useHead({
  title: 'Booking Details - ZapSlot',
  meta: [{ name: 'description', content: 'View detailed booking information' }],
})

// Types
interface BookingDetail {
  id: number
  serviceId: number
  clientId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  scheduledAt: string
  duration?: number
  totalPrice?: number
  notes?: string
  createdAt: string
  updatedAt: string
  service: {
    id: number
    title: string
    description: string
    category: string
    price?: number
    priceType: string
    contractor: {
      id: number
      description: string
      user: {
        name: string
        image?: string
        email: string
      }
    }
  }
}

// State
const booking = ref<BookingDetail | null>(null)
const loading = ref(true)
const error = ref('')
const cancelling = ref(false)
const showCancelModal = ref(false)

// Computed properties
const statusConfig = computed(() => {
  if (!booking.value) {
    return {
      badge: 'badge-warning',
      icon: 'tabler:clock',
      text: 'Pending',
      description: 'Waiting for contractor confirmation',
      color: 'warning',
    }
  }

  const configs = {
    PENDING: {
      badge: 'badge-warning',
      icon: 'tabler:clock',
      text: 'Pending',
      description: 'Waiting for contractor confirmation',
      color: 'warning',
    },
    CONFIRMED: {
      badge: 'badge-success',
      icon: 'tabler:check',
      text: 'Confirmed',
      description: 'Booking confirmed by contractor',
      color: 'success',
    },
    CANCELLED: {
      badge: 'badge-error',
      icon: 'tabler:x',
      text: 'Cancelled',
      description: 'Booking was cancelled',
      color: 'error',
    },
    COMPLETED: {
      badge: 'badge-info',
      icon: 'tabler:check-circle',
      text: 'Completed',
      description: 'Service has been completed',
      color: 'info',
    },
  }

  return configs[booking.value.status] || configs.PENDING
})

const canCancel = computed(() => {
  if (
    !booking.value ||
    (booking.value.status !== 'PENDING' && booking.value.status !== 'CONFIRMED')
  ) {
    return false
  }

  // Can only cancel if booking is at least 2 hours away
  const scheduledTime = new Date(booking.value.scheduledAt)
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000)
  return scheduledTime > twoHoursFromNow
})

const isUpcoming = computed(() => {
  if (!booking.value) return false
  const scheduledTime = new Date(booking.value.scheduledAt)
  const now = new Date()
  return scheduledTime > now
})

// Utility functions
const formatDuration = (minutes?: number): string => {
  if (!minutes) return 'N/A'
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatPrice = (priceType: string, price?: number): string => {
  if (priceType === 'NEGOTIABLE') {
    return 'Negotiable'
  }
  if (!price) return 'N/A'
  return `$${price}`
}

// Methods
const fetchBookingDetails = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch<{ booking: BookingDetail }>(
      `/api/user/bookings/${bookingId}`
    )
    booking.value = response.booking
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    error.value = errorData.data?.message || 'Failed to load booking details'
  } finally {
    loading.value = false
  }
}

const handleCancelBooking = async () => {
  if (!booking.value) return

  try {
    cancelling.value = true
    await cancelBooking(booking.value.id)

    // Update local state
    booking.value.status = 'CANCELLED'
    showCancelModal.value = false

    success(
      'Booking Cancelled',
      'Your booking has been successfully cancelled.'
    )
  } catch {
    showError(
      'Cancellation Failed',
      'Failed to cancel booking. Please try again.'
    )
  } finally {
    cancelling.value = false
  }
}

const handleContactContractor = () => {
  // TODO: Implement contact contractor functionality
  showError(
    'Feature Coming Soon',
    'Contact contractor feature will be available soon.'
  )
}

// Lifecycle
onMounted(() => {
  if (!bookingId || isNaN(bookingId)) {
    error.value = 'Invalid booking ID'
    loading.value = false
    return
  }

  fetchBookingDetails()
})
</script>

<template>
  <div class="bg-base-100 min-h-screen">
    <div class="container mx-auto max-w-4xl px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h1 class="text-base-content mb-2 text-3xl font-bold">
              Booking Details
            </h1>
            <p class="text-base-content/70">
              View detailed information about your booking
            </p>
          </div>
          <NuxtLink to="/my-bookings" class="btn btn-outline">
            <Icon name="tabler:arrow-left" class="h-4 w-4" />
            Back to Bookings
          </NuxtLink>
        </div>

        <!-- Breadcrumb -->
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/dashboard">Dashboard</NuxtLink></li>
            <li><NuxtLink to="/my-bookings">My Bookings</NuxtLink></li>
            <li>Booking #{{ bookingId }}</li>
          </ul>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error">
        <Icon name="tabler:exclamation-circle" class="h-5 w-5" />
        <span>{{ error }}</span>
        <button class="btn btn-sm btn-outline" @click="fetchBookingDetails()">
          Try Again
        </button>
      </div>

      <!-- Booking Details -->
      <div v-else-if="booking" class="space-y-8">
        <!-- Status Card -->
        <div class="card bg-base-200 shadow-lg">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="card-title text-2xl">Booking #{{ booking.id }}</h2>
                <p class="text-base-content/70">
                  Created <NuxtTime :datetime="booking.createdAt" relative />
                </p>
              </div>
              <div class="text-right">
                <div :class="['badge badge-lg', statusConfig.badge]">
                  <Icon :name="statusConfig.icon" class="mr-2 h-4 w-4" />
                  {{ statusConfig.text }}
                </div>
                <div class="text-base-content/60 mt-1 text-sm">
                  {{ statusConfig.description }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Information -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title mb-4">
              <Icon name="tabler:briefcase" class="h-6 w-6" />
              Service Information
            </h3>

            <div class="space-y-6">
              <!-- Service Details -->
              <div>
                <h4 class="mb-2 text-xl font-semibold">
                  {{ booking.service.title }}
                </h4>
                <div class="badge badge-outline mb-3">
                  {{ booking.service.category }}
                </div>
                <p class="text-base-content/80 leading-relaxed">
                  {{ booking.service.description }}
                </p>
              </div>

              <!-- Service Stats -->
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="bg-base-200 rounded-lg p-4">
                  <div class="mb-2 flex items-center gap-2">
                    <Icon
                      name="tabler:currency-dollar"
                      class="text-primary h-5 w-5"
                    />
                    <span class="font-medium">Price</span>
                  </div>
                  <div class="text-lg font-semibold">
                    {{
                      formatPrice(booking.service.priceType, booking.totalPrice)
                    }}
                  </div>
                  <div class="text-base-content/60 text-sm">
                    {{ booking.service.priceType.toLowerCase() }} pricing
                  </div>
                </div>

                <div class="bg-base-200 rounded-lg p-4">
                  <div class="mb-2 flex items-center gap-2">
                    <Icon name="tabler:clock" class="text-primary h-5 w-5" />
                    <span class="font-medium">Duration</span>
                  </div>
                  <div class="text-lg font-semibold">
                    {{ formatDuration(booking.duration) }}
                  </div>
                  <div class="text-base-content/60 text-sm">estimated time</div>
                </div>

                <div class="bg-base-200 rounded-lg p-4">
                  <div class="mb-2 flex items-center gap-2">
                    <Icon name="tabler:calendar" class="text-primary h-5 w-5" />
                    <span class="font-medium">Scheduled</span>
                  </div>
                  <div class="text-lg font-semibold">
                    <NuxtTime
                      :datetime="booking.scheduledAt"
                      day="2-digit"
                      month="2-digit"
                      year="numeric"
                    />
                  </div>
                  <div class="text-base-content/60 text-sm">
                    <NuxtTime :datetime="booking.scheduledAt" relative />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contractor Information -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title mb-4">
              <Icon name="tabler:user" class="h-6 w-6" />
              Contractor Information
            </h3>

            <div class="flex items-start gap-4">
              <div class="avatar">
                <div class="bg-primary w-16 rounded-full">
                  <img
                    v-if="booking.service.contractor.user.image"
                    :src="booking.service.contractor.user.image"
                    :alt="booking.service.contractor.user.name"
                    class="rounded-full"
                  >
                  <div
                    v-else
                    class="text-primary-content flex h-full w-full items-center justify-center text-lg font-bold"
                  >
                    {{ getInitials(booking.service.contractor.user.name) }}
                  </div>
                </div>
              </div>

              <div class="flex-1">
                <h4 class="mb-1 text-xl font-semibold">
                  {{ booking.service.contractor.user.name }}
                </h4>
                <p class="text-base-content/80 leading-relaxed">
                  {{ booking.service.contractor.description }}
                </p>
              </div>

              <button class="btn btn-outline" @click="handleContactContractor">
                <Icon name="tabler:message" class="h-4 w-4" />
                Contact
              </button>
            </div>
          </div>
        </div>

        <!-- Booking Notes -->
        <div v-if="booking.notes" class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title mb-4">
              <Icon name="tabler:note" class="h-6 w-6" />
              Special Notes
            </h3>
            <div class="bg-base-200 rounded-lg p-4">
              <p class="text-base-content/80 leading-relaxed">
                {{ booking.notes }}
              </p>
            </div>
          </div>
        </div>

        <!-- Booking Timeline -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title mb-4">
              <Icon name="tabler:timeline" class="h-6 w-6" />
              Booking Timeline
            </h3>

            <div class="space-y-4">
              <!-- Created -->
              <div class="flex items-center gap-4">
                <div
                  class="bg-primary text-primary-content flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <Icon name="tabler:plus" class="h-4 w-4" />
                </div>
                <div>
                  <div class="font-medium">Booking Created</div>
                  <div class="text-base-content/60 text-sm">
                    <NuxtTime :datetime="booking.createdAt" />
                  </div>
                </div>
              </div>

              <!-- Current Status -->
              <div class="flex items-center gap-4">
                <div
                  :class="[
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    `bg-${statusConfig.color}`,
                    `text-${statusConfig.color}-content`,
                  ]"
                >
                  <Icon :name="statusConfig.icon" class="h-4 w-4" />
                </div>
                <div>
                  <div class="font-medium">{{ statusConfig.text }}</div>
                  <div class="text-base-content/60 text-sm">
                    <NuxtTime :datetime="booking.updatedAt" />
                  </div>
                </div>
              </div>

              <!-- Scheduled (if upcoming) -->
              <div v-if="isUpcoming" class="flex items-center gap-4">
                <div
                  class="bg-base-300 text-base-content flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <Icon name="tabler:calendar-event" class="h-4 w-4" />
                </div>
                <div>
                  <div class="font-medium">Service Scheduled</div>
                  <div class="text-base-content/60 text-sm">
                    <NuxtTime :datetime="booking.scheduledAt" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title mb-4">
              <Icon name="tabler:settings" class="h-6 w-6" />
              Actions
            </h3>

            <div class="flex flex-wrap gap-4">
              <!-- Cancel Button -->
              <button
                v-if="canCancel"
                class="btn btn-error"
                @click="showCancelModal = true"
              >
                <Icon name="tabler:x" class="h-4 w-4" />
                Cancel Booking
              </button>

              <!-- Contact Contractor -->
              <button class="btn btn-outline" @click="handleContactContractor">
                <Icon name="tabler:message" class="h-4 w-4" />
                Contact Contractor
              </button>

              <!-- Reschedule (future feature) -->
              <button
                class="btn btn-outline"
                disabled
                title="Feature coming soon"
              >
                <Icon name="tabler:calendar-plus" class="h-4 w-4" />
                Reschedule
              </button>

              <!-- Leave Review (future feature) -->
              <button
                v-if="booking.status === 'COMPLETED'"
                class="btn btn-outline"
                disabled
                title="Feature coming soon"
              >
                <Icon name="tabler:star" class="h-4 w-4" />
                Leave Review
              </button>
            </div>

            <!-- Cancellation Policy -->
            <div v-if="canCancel" class="alert alert-warning mt-4">
              <Icon name="tabler:info-circle" class="h-5 w-5" />
              <div>
                <strong>Cancellation Policy:</strong>
                You can cancel this booking up to 2 hours before the scheduled
                time. Cancellations made within 2 hours may not be eligible for
                refunds.
              </div>
            </div>

            <div
              v-else-if="
                booking.status === 'PENDING' || booking.status === 'CONFIRMED'
              "
              class="alert alert-info mt-4"
            >
              <Icon name="tabler:clock" class="h-5 w-5" />
              <div>
                This booking can no longer be cancelled as it's scheduled within
                2 hours. Please contact the contractor directly if you need to
                make changes.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancellation Modal -->
      <div v-if="showCancelModal" class="modal modal-open">
        <div class="modal-box">
          <h3 class="mb-4 text-lg font-bold">Cancel Booking</h3>
          <p class="mb-6">
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </p>

          <div class="modal-action">
            <button
              class="btn"
              :disabled="cancelling"
              @click="showCancelModal = false"
            >
              Keep Booking
            </button>
            <button
              class="btn btn-error"
              :disabled="cancelling"
              @click="handleCancelBooking"
            >
              <span
                v-if="cancelling"
                class="loading loading-spinner loading-sm mr-2"
              />
              {{ cancelling ? 'Cancelling...' : 'Yes, Cancel' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
