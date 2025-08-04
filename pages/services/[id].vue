<template>
  <div class="bg-base-100 min-h-screen">
    <!-- Loading State -->
    <div v-if="loading" class="flex min-h-screen items-center justify-center">
      <span class="loading loading-spinner loading-lg" />
      <span class="ml-4 text-lg">Loading service details...</span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex min-h-screen items-center justify-center"
    >
      <div class="text-center">
        <Icon
          name="tabler:alert-circle"
          class="text-error mx-auto mb-4 h-24 w-24"
        />
        <h2 class="mb-2 text-2xl font-bold">Service Not Found</h2>
        <p class="text-base-content/70 mb-6">{{ error }}</p>
        <NuxtLink to="/services" class="btn btn-primary">
          Browse All Services
        </NuxtLink>
      </div>
    </div>

    <!-- Service Detail -->
    <div v-else-if="service" class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <div class="breadcrumbs mb-6 text-sm">
        <ul>
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/services">Services</NuxtLink></li>
          <li>{{ service.title }}</li>
        </ul>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Service Header -->
          <div class="card bg-base-100 mb-6 shadow-lg">
            <div class="card-body">
              <div class="mb-4 flex items-start justify-between">
                <div>
                  <h1 class="mb-2 text-3xl font-bold">{{ service.title }}</h1>
                  <div class="badge badge-primary badge-lg">
                    {{ service.category }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-success text-3xl font-bold">
                    <span v-if="service.price">${{ service.price }}</span>
                    <span v-else class="text-lg">Negotiable</span>
                  </div>
                  <div class="text-base-content/70 text-sm">
                    {{
                      service.priceType === 'HOURLY'
                        ? 'per hour'
                        : service.priceType === 'FIXED'
                          ? 'fixed price'
                          : 'negotiable'
                    }}
                  </div>
                </div>
              </div>

              <!-- Service Stats -->
              <div class="stats stats-horizontal w-full shadow">
                <div class="stat">
                  <div class="stat-figure text-success">
                    <Icon name="tabler:clock" class="h-8 w-8" />
                  </div>
                  <div class="stat-title">Duration</div>
                  <div class="stat-value text-lg">
                    <span v-if="service.duration">{{
                      formatDuration(service.duration)
                    }}</span>
                    <span v-else>Flexible</span>
                  </div>
                </div>

                <div class="stat">
                  <div class="stat-figure text-warning">
                    <Icon name="tabler:calendar" class="h-8 w-8" />
                  </div>
                  <div class="stat-title">Availability</div>
                  <div class="stat-value text-lg">
                    {{ formatAvailability(service.availability) }}
                  </div>
                </div>

                <div class="stat">
                  <div class="stat-figure text-secondary">
                    <Icon name="tabler:users" class="h-8 w-8" />
                  </div>
                  <div class="stat-title">Bookings</div>
                  <div class="stat-value text-lg">
                    {{ service.bookingsCount }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Service Description -->
          <div class="card bg-base-100 mb-6 shadow-lg">
            <div class="card-body">
              <h2 class="card-title mb-4 text-xl">
                <Icon name="tabler:file-text" class="h-6 w-6" />
                Description
              </h2>
              <div class="prose max-w-none">
                <p class="text-base leading-relaxed">
                  {{ service.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Contractor Info -->
          <div class="card bg-base-100 mb-6 shadow-lg">
            <div class="card-body">
              <h2 class="card-title mb-4 text-xl">
                <Icon name="tabler:user" class="h-6 w-6" />
                Contractor
              </h2>

              <div class="mb-4 flex items-center gap-4">
                <div class="avatar">
                  <div class="bg-primary w-16 rounded-full">
                    <img
                      v-if="service.contractor.user.image"
                      :src="service.contractor.user.image"
                      :alt="service.contractor.user.name"
                      class="rounded-full"
                    >
                    <div
                      v-else
                      class="text-primary-content flex h-full w-full items-center justify-center font-bold"
                    >
                      {{ getInitials(service.contractor.user.name) }}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="text-lg font-bold">
                    {{ service.contractor.user.name }}
                  </h3>
                  <p class="text-base-content/70 text-sm">
                    Professional Service Provider
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <Icon name="tabler:briefcase" class="text-primary h-4 w-4" />
                  <span class="text-sm">{{
                    service.contractor.categories
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon
                    name="tabler:currency-dollar"
                    class="text-success h-4 w-4"
                  />
                  <span class="text-sm">{{ service.contractor.price }}</span>
                </div>
              </div>

              <div class="border-base-300 mt-4 border-t pt-4">
                <p class="text-base-content/70 text-sm">
                  {{ service.contractor.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Booking Card -->
          <div
            class="card from-primary to-secondary text-primary-content bg-gradient-to-br shadow-lg"
          >
            <div class="card-body">
              <h2 class="card-title mb-4 text-xl">
                <Icon name="tabler:calendar-plus" class="h-6 w-6" />
                Book This Service
              </h2>

              <div class="space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text text-primary-content/90"
                      >Preferred Date</span
                    >
                  </label>
                  <input
                    v-model="bookingDate"
                    type="date"
                    class="input input-bordered bg-base-100 text-base-content"
                    :min="minDate"
                    :max="maxDate"
                  >
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text text-primary-content/90"
                      >Preferred Time</span
                    >
                  </label>
                  <select
                    v-model="bookingTime"
                    class="select select-bordered bg-base-100 text-base-content"
                    :disabled="
                      !bookingDate || availableTimesForDate.length === 0
                    "
                  >
                    <option value="" disabled>
                      {{
                        availableTimesForDate.length === 0
                          ? 'No available times'
                          : 'Select time'
                      }}
                    </option>
                    <option
                      v-for="slot in availableTimesForDate"
                      :key="slot.time"
                      :value="slot.time"
                    >
                      {{ formatTime(slot.time) }}
                    </option>
                  </select>
                  <label v-if="slotsLoading" class="label">
                    <span class="label-text-alt text-primary-content/70">
                      <span class="loading loading-spinner loading-xs mr-1" />
                      Loading available times...
                    </span>
                  </label>
                  <label
                    v-else-if="
                      bookingDate && availableTimesForDate.length === 0
                    "
                    class="label"
                  >
                    <span class="label-text-alt text-warning">
                      No available times for this date
                    </span>
                  </label>
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text text-primary-content/90"
                      >Additional Notes</span
                    >
                  </label>
                  <textarea
                    v-model="bookingNotes"
                    class="textarea textarea-bordered bg-base-100 text-base-content"
                    placeholder="Any special requirements or details..."
                    rows="3"
                  />
                </div>

                <button
                  class="btn btn-accent w-full"
                  :disabled="!bookingDate || !bookingTime || bookingLoading"
                  @click="handleBooking"
                >
                  <span v-if="bookingLoading" class="loading loading-spinner" />
                  <Icon v-else name="tabler:calendar-check" class="h-5 w-5" />
                  {{ bookingLoading ? 'Booking...' : 'Book Now' }}
                </button>
              </div>

              <div class="alert alert-info mt-4 text-sm">
                <Icon name="tabler:info-circle" class="h-4 w-4" />
                <span
                  >Your booking will be confirmed immediately and you'll receive
                  details shortly.</span
                >
              </div>

              <div
                v-if="nextAvailableSlot && !slotsLoading"
                class="alert alert-success mt-2 text-sm"
              >
                <Icon name="tabler:calendar-check" class="h-4 w-4" />
                <span>
                  Next available: {{ formatDate(nextAvailableSlot.date) }} at
                  {{ formatTime(nextAvailableSlot.time) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

// Get service ID from route
const route = useRoute()
const serviceId = route.params.id

// Notifications
const { success, error: showError } = useNotifications()

definePageMeta({
  title: 'Service Details',
  description: 'View service details and book your appointment',
})

// Types
interface Service {
  id: number
  title: string
  description: string
  category: string
  price: string | null
  priceType: string
  duration: number | null
  availability: string
  contractor: {
    id: number
    categories: string
    description: string
    price: string | null
    user: {
      name: string
      image: string | null
    }
  }
  bookingsCount: number
}

// State
const service = ref<Service | null>(null)
const loading = ref(true)
const error = ref('')
const bookingLoading = ref(false)
const slotsLoading = ref(false)

// Available slots
const availableSlots = ref<
  Array<{ date: string; time: string; datetime: string }>
>([])
const nextAvailableSlot = ref<{
  date: string
  time: string
  datetime: string
} | null>(null)

// Booking form
const bookingDate = ref('')
const bookingTime = ref('')
const bookingNotes = ref('')

// Client-side minimum and maximum dates to prevent hydration mismatch
const minDate = ref('')
const maxDate = ref('')

onMounted(() => {
  const today = new Date()
  minDate.value = today.toISOString().split('T')[0]

  // Set today as default date
  bookingDate.value = today.toISOString().split('T')[0]
})

// Computed properties
const availableTimesForDate = computed(() => {
  if (!bookingDate.value) return []

  const slotsForDate = availableSlots.value.filter(
    (slot) => slot.date === bookingDate.value
  )

  // If this is today, filter out past times
  if (bookingDate.value === minDate.value) {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    return slotsForDate.filter((slot) => slot.time >= currentTime)
  }

  return slotsForDate
})

// Update max date based on available slots
const updateDateLimits = () => {
  if (availableSlots.value.length > 0) {
    const dates = availableSlots.value
      .map((slot) => slot.date)
      .sort((a, b) => a.localeCompare(b))
    const lastAvailableDate = dates[dates.length - 1]
    maxDate.value = lastAvailableDate
  }
}

// Watch for date changes and reset time if selected time is no longer available
watch(bookingDate, () => {
  if (bookingTime.value && availableTimesForDate.value.length > 0) {
    const isTimeStillAvailable = availableTimesForDate.value.some(
      (slot) => slot.time === bookingTime.value
    )
    if (!isTimeStillAvailable) {
      bookingTime.value = ''
    }
  }
})

// Utility functions
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDuration = (minutes: number): string => {
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

const formatAvailability = (availability: string): string => {
  const availabilityMap: Record<string, string> = {
    WEEKDAYS: 'Weekdays',
    WEEKENDS: 'Weekends',
    MORNINGS: 'Mornings',
    EVENINGS: 'Evenings',
    FLEXIBLE: 'Flexible',
  }
  return availabilityMap[availability] || availability
}

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const minute = minutes
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minute} ${ampm}`
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Fetch service details
const fetchService = async () => {
  try {
    loading.value = true
    const response = await $fetch<{ service: Service }>(
      `/api/services/${serviceId}`
    )
    service.value = response.service

    // Fetch available slots after service is loaded
    await fetchAvailableSlots()
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    error.value = errorData.data?.message || 'Service not found'
  } finally {
    loading.value = false
  }
}

// Fetch available time slots
const fetchAvailableSlots = async () => {
  try {
    slotsLoading.value = true
    const response = await $fetch<{
      availableSlots: Array<{ date: string; time: string; datetime: string }>
      nextAvailableSlot: { date: string; time: string; datetime: string } | null
    }>(`/api/services/${serviceId}/available-slots`)

    availableSlots.value = response.availableSlots
    nextAvailableSlot.value = response.nextAvailableSlot

    // Update date limits based on available slots
    updateDateLimits()

    // Set the next available slot as default if no time is selected
    if (nextAvailableSlot.value && !bookingTime.value) {
      bookingDate.value = nextAvailableSlot.value.date
      bookingTime.value = nextAvailableSlot.value.time
    }
  } catch (err: unknown) {
    console.error('Failed to fetch available slots:', err)
    // Don't show error to user, just log it
  } finally {
    slotsLoading.value = false
  }
}

// Handle booking
const handleBooking = async () => {
  if (!bookingDate.value || !bookingTime.value) return

  bookingLoading.value = true

  try {
    // Combine date and time
    const scheduledAt = new Date(`${bookingDate.value}T${bookingTime.value}`)

    await $fetch(`/api/services/${serviceId}/book`, {
      method: 'POST',
      body: {
        scheduledAt: scheduledAt.toISOString(),
        notes: bookingNotes.value,
      },
    })

    // Show success notification
    success(
      'Booking Successful!',
      'Your booking request has been sent to the contractor. They will contact you soon to confirm the details.'
    )

    // Reset form
    bookingDate.value = ''
    bookingTime.value = ''
    bookingNotes.value = ''
  } catch (err: unknown) {
    // Show error notification
    const errorData = err as { data?: { message?: string } }
    showError(
      'Booking Failed',
      errorData.data?.message || 'Failed to create booking. Please try again.'
    )
  } finally {
    bookingLoading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchService()
})

// Watch for date changes to update available times
watch(bookingDate, async (newDate) => {
  if (newDate && service.value) {
    // Filter available slots for the selected date
    const slotsForDate = availableSlots.value.filter(
      (slot) => slot.date === newDate
    )

    // If no time is selected or current time is not available for new date, set first available time
    if (
      !bookingTime.value ||
      !slotsForDate.some((slot) => slot.time === bookingTime.value)
    ) {
      bookingTime.value = slotsForDate[0]?.time || ''
    }
  }
})
</script>
