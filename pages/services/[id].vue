<template>
  <div class="bg-base-100 min-h-screen">
    <!-- Loading State -->
    <div v-if="loading" class="flex min-h-screen items-center justify-center">
      <span class="loading loading-spinner loading-lg" />
      <span class="ml-4 text-lg">Loading service details...</span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="!loading && serviceError"
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
    <div v-else-if="!loading && service" class="container mx-auto px-4 py-8">
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
          <div class="card bg-base-200 mb-6 shadow-lg">
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
          <div class="card bg-base-200 mb-6 shadow-lg">
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

          <!-- Reviews -->
          <div class="card bg-base-200 mb-6 shadow-lg">
            <div class="card-body">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="card-title text-xl">
                  <Icon name="tabler:star" class="text-warning h-6 w-6" />
                  Reviews
                </h2>
                <div
                  v-if="reviewsStats"
                  class="flex items-center gap-2 text-sm"
                >
                  <StarRating
                    :model-value="reviewsStats.averageRating"
                    readonly
                  />
                  <span class="opacity-80"
                    >{{ reviewsStats.averageRating.toFixed(1) }} •
                    {{ reviewsStats.reviewsCount }} reviews</span
                  >
                </div>
              </div>

              <div v-if="reviewsLoading" class="flex items-center gap-2">
                <span class="loading loading-spinner loading-sm" /> Loading
                reviews...
              </div>

              <div v-else>
                <div v-if="reviews.length === 0" class="text-sm opacity-70">
                  No reviews yet.
                </div>

                <ul v-else class="space-y-4">
                  <li
                    v-for="rev in reviews"
                    :key="rev.id"
                    class="bg-base-100 rounded-lg p-4"
                  >
                    <div class="mb-1 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="avatar">
                          <div class="w-8 rounded-full">
                            <img
                              v-if="rev.client.image"
                              :src="rev.client.image"
                              :alt="rev.client.name"
                            >
                            <div
                              v-else
                              class="bg-primary text-primary-content flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                            >
                              {{ getInitials(rev.client.name) }}
                            </div>
                          </div>
                        </div>
                        <span class="text-sm font-medium">{{
                          rev.client.name
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <StarRating :model-value="rev.rating" readonly />
                      </div>
                    </div>
                    <p v-if="rev.comment" class="text-sm">{{ rev.comment }}</p>
                    <div class="mt-1 text-xs opacity-60">
                      <NuxtTime :datetime="rev.createdAt" />
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Add Review Form (simple) -->
              <div
                v-if="isAuthenticated"
                class="border-base-300 mt-6 border-t pt-4"
              >
                <h3 class="mb-4 text-sm font-semibold">Leave a review</h3>
                <div class="space-y-4">
                  <div>
                    <label class="label">
                      <span class="label-text">Rating</span>
                    </label>
                    <StarRating v-model="newReview.rating" show-text />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">Comment (optional)</span>
                    </label>
                    <textarea
                      v-model="newReview.comment"
                      maxlength="1000"
                      placeholder="Share your experience with this service..."
                      class="textarea textarea-bordered w-full"
                      rows="3"
                    />
                  </div>
                  <button
                    class="btn btn-primary"
                    :disabled="submittingReview || newReview.rating === 0"
                    @click="submitReview"
                  >
                    <span
                      v-if="submittingReview"
                      class="loading loading-spinner loading-sm"
                    />
                    <span v-else>Submit Review</span>
                  </button>
                </div>
                <div v-if="reviewError" class="alert alert-error mt-3 text-sm">
                  <Icon name="tabler:alert-circle" />
                  <span>{{ reviewError }}</span>
                </div>
              </div>
              <div v-else class="mt-6 text-sm opacity-70">
                Sign in to leave a review.
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Contractor Info -->
          <div class="card bg-base-200 mb-6 shadow-lg">
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
                    class="input input-bordered bg-base-200 text-base-content"
                    :min="minDate"
                    :max="maxDateComputed"
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
                    class="select select-bordered bg-base-200 text-base-content"
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
                    class="textarea textarea-bordered bg-base-200 text-base-content"
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

    <!-- Fallback state -->
    <div v-else class="flex min-h-screen items-center justify-center">
      <div class="text-center">
        <Icon
          name="tabler:alert-circle"
          class="text-warning mx-auto mb-4 h-24 w-24"
        />
        <h2 class="mb-2 text-2xl font-bold">Service Not Available</h2>
        <p class="text-base-content/70 mb-6">
          This service is currently not available.
        </p>
        <NuxtLink to="/services" class="btn btn-primary">
          Browse All Services
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
const { isAuthenticated } = useAuth()

// Get service ID from route
const route = useRoute()
const serviceId = route.params.id as string

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
  reviewsCount?: number
}

interface AvailableSlot {
  date: string
  time: string
  datetime: string
}

// Fetch service data using useFetch
const {
  data: serviceData,
  pending: loading,
  error: serviceError,
} = useFetch<{ service: Service }>(`/api/services/${serviceId}`, {
  key: `service-${serviceId}`,
})

// Fetch available slots using useFetch
const {
  data: slotsData,
  pending: slotsLoading,
  refresh: refreshSlots,
} = useFetch<{
  availableSlots: AvailableSlot[]
  nextAvailableSlot: AvailableSlot | null
}>(`/api/services/${serviceId}/available-slots`, {
  key: `slots-${serviceId}`,
})

// Computed reactive data
const service = computed(() => serviceData.value?.service || null)
const availableSlots = computed(() => slotsData.value?.availableSlots || [])
const nextAvailableSlot = computed(
  () => slotsData.value?.nextAvailableSlot || null
)
const error = computed(
  () => serviceError.value?.data?.message || 'Service not found'
)

// Booking state
const bookingLoading = ref(false)

// Booking form
const bookingDate = ref('')
const bookingTime = ref('')
const bookingNotes = ref('')

// Reviews state
interface ReviewItem {
  id: number
  rating: number
  comment?: string | null
  createdAt: string
  client: { name: string; image: string | null }
}
const reviews = ref<ReviewItem[]>([])
const reviewsStats = ref<{
  averageRating: number
  reviewsCount: number
} | null>(null)
const reviewsLoading = ref(true)
const submittingReview = ref(false)
const reviewError = ref('')
const newReview = ref<{ rating: number; comment: string }>({
  rating: 0,
  comment: '',
})

const loadReviews = async () => {
  try {
    reviewsLoading.value = true
    const res = await $fetch<{
      reviews: ReviewItem[]
      stats: { averageRating: number; reviewsCount: number }
    }>(`/api/services/${serviceId}/reviews`)
    reviews.value = res.reviews
    reviewsStats.value = res.stats
  } catch {
    // swallow for now
  } finally {
    reviewsLoading.value = false
  }
}

onMounted(() => {
  // existing onMounted logic...
  // load reviews
  loadReviews()
})

const submitReview = async () => {
  reviewError.value = ''
  if (newReview.value.rating === 0) return
  submittingReview.value = true
  try {
    await $fetch<{ review: { id: number } }>(
      `/api/services/${serviceId}/reviews`,
      {
        method: 'POST',
        body: {
          rating: newReview.value.rating,
          comment: newReview.value.comment || undefined,
        },
      }
    )
    newReview.value = { rating: 0, comment: '' }
    await loadReviews()
    success('Review submitted', 'Thank you for your feedback!')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    reviewError.value = e?.data?.message || 'Failed to submit review'
  } finally {
    submittingReview.value = false
  }
}

// Client-side minimum date to prevent hydration mismatch
const minDate = ref('')

onMounted(() => {
  const today = new Date()
  minDate.value = today.toISOString().split('T')[0]
  bookingDate.value = today.toISOString().split('T')[0]

  // Set default booking time from next available slot
  if (nextAvailableSlot.value && !bookingTime.value) {
    bookingDate.value = nextAvailableSlot.value.date
    bookingTime.value = nextAvailableSlot.value.time
  }
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
const maxDateComputed = computed(() => {
  if (availableSlots.value.length > 0) {
    const dates = availableSlots.value
      .map((slot) => slot.date)
      .sort((a, b) => a.localeCompare(b))
    return dates[dates.length - 1]
  }
  return ''
})

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

// Handle booking
const handleBooking = async () => {
  if (!bookingDate.value || !bookingTime.value) return

  bookingLoading.value = true

  try {
    // Combine date and time
    const scheduledAt = new Date(`${bookingDate.value}T${bookingTime.value}`)

    const response = await $fetch<{ booking: { id: number } }>(
      `/api/services/${serviceId}/book`,
      {
        method: 'POST',
        body: {
          scheduledAt: scheduledAt.toISOString(),
          notes: bookingNotes.value,
        },
      }
    )

    // Show success notification
    success(
      'Booking Confirmed!',
      'Your booking has been confirmed! Redirecting to booking details...'
    )

    // Refresh available slots to show updated availability
    await refreshSlots()

    // Redirect to specific booking page after a short delay
    setTimeout(() => {
      navigateTo(`/my-bookings/${response.booking.id}`)
    }, 1500)
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
