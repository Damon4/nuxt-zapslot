<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-base-content text-3xl font-bold">
          Calendar Management
        </h1>
        <p class="text-base-content/70 mt-2">
          Manage your bookings and availability schedule
        </p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Refresh Button -->
        <button
          class="btn btn-outline"
          :disabled="loading"
          @click="refreshData"
        >
          <Icon name="tabler:refresh" class="h-4 w-4" />
          Refresh
        </button>

        <!-- Settings Button -->
        <button class="btn btn-primary" @click="showAvailabilityModal = true">
          <Icon name="tabler:settings" class="h-4 w-4" />
          Availability Settings
        </button>
      </div>
    </div>

    <!-- Calendar Component -->
    <CalendarView
      :bookings="bookings"
      :loading="loading"
      @date-select="handleDateSelect"
      @event-click="handleEventClick"
      @event-drop="handleEventDrop"
      @view-change="handleViewChange"
    />

    <!-- Booking Details Modal -->
    <BookingDetailsModal
      v-if="showBookingDetails"
      :booking="selectedBooking"
      @close="closeBookingDetails"
      @update-status="handleStatusUpdate"
      @reschedule="handleReschedule"
    />

    <!-- Availability Settings Modal -->
    <AvailabilityModal
      v-if="showAvailabilityModal"
      :availability="availability"
      @close="closeAvailabilityModal"
      @saved="handleAvailabilitySaved"
    />

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
    >
      <div class="bg-base-100 rounded-lg p-6 shadow-xl">
        <div class="flex items-center gap-3">
          <span class="loading loading-spinner loading-lg" />
          <span class="text-lg">Loading calendar...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Types
interface BookingType {
  id: number
  serviceId: number
  clientId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  scheduledAt: string
  duration?: number
  totalPrice?: number
  notes?: string
  service?: {
    title: string
    category: string
  }
  client?: {
    name: string
    email: string
  }
}

interface AvailabilityType {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

// Components
const CalendarView = defineAsyncComponent(
  () => import('~/components/calendar/CalendarView.vue')
)
const BookingDetailsModal = defineAsyncComponent(
  () => import('~/components/modals/BookingDetailsModal.vue')
)
const AvailabilityModal = defineAsyncComponent(
  () => import('~/components/modals/AvailabilityModal.vue')
)

// Define page meta
definePageMeta({
  middleware: 'contractor',
  layout: 'default',
})

// Head meta
useHead({
  title: 'Calendar - Contractor Dashboard',
  meta: [
    {
      name: 'description',
      content:
        'Manage your bookings and availability with our interactive calendar interface.',
    },
  ],
})

// Composables
const { bookings, fetchContractorBookings, updateBookingStatus } = useBookings()
const { success, error } = useNotifications()

// Reactive state
const loading = ref(false)
const selectedBooking = ref<BookingType | null>(null)
const availability = ref<AvailabilityType[]>([])
const showBookingDetails = ref(false)
const showAvailabilityModal = ref(false)
const currentView = ref('dayGridMonth')

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([fetchContractorBookings(), fetchAvailability()])
    success('Data Refreshed', 'Calendar data has been updated')
  } catch {
    error('Refresh Failed', 'Failed to refresh calendar data')
  } finally {
    loading.value = false
  }
}

const fetchAvailability = async () => {
  try {
    const data = await $fetch<{ availability: AvailabilityType[] }>(
      '/api/contractor/calendar/availability'
    )
    availability.value = data.availability
  } catch (err) {
    console.error('Failed to fetch availability:', err)
  }
}

const handleDateSelect = (start: Date, end: Date) => {
  console.log('Date selected:', start, end)
  // Handle date selection (could open quick booking modal)
}

const handleEventClick = (booking: BookingType) => {
  selectedBooking.value = booking
  showBookingDetails.value = true
}

const handleEventDrop = (
  booking: BookingType,
  newStart: Date,
  newEnd: Date
) => {
  console.log('Event dropped:', booking, newStart, newEnd)
  // Handle booking reschedule
}

const handleViewChange = (view: string) => {
  currentView.value = view
  console.log('View changed to:', view)
}

const closeBookingDetails = () => {
  showBookingDetails.value = false
  selectedBooking.value = null
}

const closeAvailabilityModal = () => {
  showAvailabilityModal.value = false
}

const handleStatusUpdate = async (
  bookingId: number,
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
) => {
  try {
    await updateBookingStatus(bookingId, status)
    success(
      'Status Updated',
      `Booking status updated to ${status.toLowerCase()}`
    )
    closeBookingDetails()
    await fetchContractorBookings()
  } catch {
    error('Update Failed', 'Failed to update booking status')
  }
}

const handleReschedule = (booking: BookingType) => {
  // Handle reschedule logic
  console.log('Reschedule booking:', booking)
  closeBookingDetails()
}

const handleAvailabilitySaved = (newAvailability: AvailabilityType[]) => {
  availability.value = newAvailability
  success('Availability Saved', 'Your availability settings have been updated')
  closeAvailabilityModal()
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([fetchContractorBookings(), fetchAvailability()])
  } catch {
    error('Loading Failed', 'Failed to load calendar data')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Custom styles for calendar page */
.container {
  max-width: 1400px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
