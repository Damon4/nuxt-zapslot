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
    <div class="mb-8">
      <CalendarView
        :bookings="bookings"
        :loading="loading"
        @date-select="handleDateSelect"
        @event-click="handleEventClick"
        @event-drop="handleEventDrop"
        @view-change="handleViewChange"
      />
    </div>

    <!-- Time Slot Manager -->
    <div class="mb-8">
      <TimeSlotManager
        :availability="availability"
        :blocked-slots="blockedSlots"
        @edit-availability="showAvailabilityModal = true"
        @block-time="showBlockTimeModal = true"
        @refresh-data="refreshData"
      />
    </div>

    <!-- Booking Details Modal -->
    <!-- <BookingDetailsModal
      v-if="showBookingDetails && selectedBooking"
      :booking="selectedBooking"
      @close="closeBookingDetails"
      @update-status="handleStatusUpdate"
      @reschedule="handleReschedule"
    /> -->

    <!-- Modals (Client-only to avoid SSR issues) -->
    <ClientOnly>
      <!-- Availability Settings Modal -->
      <AvailabilityEditorModal
        :is-open="showAvailabilityModal"
        :availability="availability"
        @close="showAvailabilityModal = false"
        @saved="handleAvailabilitySaved"
      />

      <!-- Block Time Modal -->
      <BlockTimeModal
        :is-open="showBlockTimeModal"
        :selected-date="selectedDate"
        :selected-time="selectedTime"
        @close="showBlockTimeModal = false"
        @blocked="handleTimeBlocked"
      />
    </ClientOnly>

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

interface BlockedSlotType {
  id: number
  date: string
  startTime: string
  endTime: string
  reason?: string
}

// Components
const CalendarView = defineAsyncComponent(
  () => import('~/components/calendar/CalendarView.vue')
)
const TimeSlotManager = defineAsyncComponent(
  () => import('~/components/calendar/TimeSlotManager.vue')
)
const AvailabilityEditorModal = defineAsyncComponent(
  () => import('~/components/modals/AvailabilityEditorModal.vue')
)
const BlockTimeModal = defineAsyncComponent(
  () => import('~/components/modals/BlockTimeModal.vue')
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
const { bookings, fetchContractorBookings } = useBookings()
const { success, error } = useNotifications()

// Reactive state
const loading = ref(false)
const selectedBooking = ref<BookingType | null>(null)
const availability = ref<AvailabilityType[]>([])
const blockedSlots = ref<BlockedSlotType[]>([])
const showBookingDetails = ref(false)
const showAvailabilityModal = ref(false)
const showBlockTimeModal = ref(false)
const selectedDate = ref('')
const selectedTime = ref('')
const currentView = ref('dayGridMonth')

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchContractorBookings(),
      fetchAvailability(),
      fetchBlockedSlots(),
    ])
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

const fetchBlockedSlots = async () => {
  try {
    const data = await $fetch<{ timeSlots: BlockedSlotType[] }>(
      '/api/contractor/calendar/blocked-slots'
    )
    blockedSlots.value = data.timeSlots
  } catch (err) {
    console.error('Failed to fetch blocked slots:', err)
    // For now, just set empty array if API doesn't exist
    blockedSlots.value = []
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

const handleTimeBlocked = (_data: unknown) => {
  // Refresh blocked slots
  fetchBlockedSlots()
  success('Time Blocked', 'The time slot has been blocked successfully.')
}

const handleAvailabilitySaved = (data: unknown) => {
  availability.value = data as AvailabilityType[]
  success(
    'Availability Updated',
    'Your availability has been saved successfully.'
  )
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
