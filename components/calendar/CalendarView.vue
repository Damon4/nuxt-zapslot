<template>
  <div class="calendar-container">
    <!-- Calendar Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-base-content text-2xl font-bold">
          {{ currentMonth }}
        </h2>
        <p class="text-base-content/70 mt-1">
          Manage your bookings and availability
        </p>
      </div>

      <!-- View Toggle -->
      <div class="flex items-center gap-4">
        <div class="btn-group">
          <button
            class="btn btn-sm"
            :class="{ 'btn-active': currentView === 'dayGridMonth' }"
            @click="changeView('dayGridMonth')"
          >
            Month
          </button>
          <button
            class="btn btn-sm"
            :class="{ 'btn-active': currentView === 'timeGridWeek' }"
            @click="changeView('timeGridWeek')"
          >
            Week
          </button>
          <button
            class="btn btn-sm"
            :class="{ 'btn-active': currentView === 'timeGridDay' }"
            @click="changeView('timeGridDay')"
          >
            Day
          </button>
        </div>

        <button class="btn btn-outline btn-sm" @click="goToToday">
          <Icon name="tabler:calendar-event" class="h-4 w-4" />
          Today
        </button>
      </div>
    </div>

    <!-- Calendar Stats -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="stat bg-base-100 rounded-lg shadow-sm">
        <div class="stat-title">Today's Bookings</div>
        <div class="stat-value text-primary text-2xl">
          {{ todayBookings.length }}
        </div>
        <div class="stat-desc">
          {{ todayBookings.filter((b) => b.status === 'CONFIRMED').length }}
          confirmed
        </div>
      </div>

      <div class="stat bg-base-100 rounded-lg shadow-sm">
        <div class="stat-title">This Week</div>
        <div class="stat-value text-info text-2xl">
          {{ thisWeekBookings.length }}
        </div>
        <div class="stat-desc">
          {{ thisWeekBookings.filter((b) => b.status === 'PENDING').length }}
          pending
        </div>
      </div>

      <div class="stat bg-base-100 rounded-lg shadow-sm">
        <div class="stat-title">Available Slots</div>
        <div class="stat-value text-success text-2xl">{{ availableSlots }}</div>
        <div class="stat-desc">This week</div>
      </div>

      <div class="stat bg-base-100 rounded-lg shadow-sm">
        <div class="stat-title">Revenue</div>
        <div class="stat-value text-accent text-2xl">${{ weeklyRevenue }}</div>
        <div class="stat-desc">This week</div>
      </div>
    </div>

    <!-- Calendar Component -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4">
        <FullCalendar
          ref="calendar"
          :options="calendarOptions"
          class="custom-calendar"
        />
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="bg-base-100/80 absolute inset-0 flex items-center justify-center rounded-lg"
    >
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Quick Booking Modal -->
    <QuickBookingModal
      v-if="showQuickBooking"
      :selected-date="selectedDate"
      :selected-time="selectedTime"
      @close="closeQuickBooking"
      @created="handleBookingCreated"
    />

    <!-- Reschedule Modal -->
    <RescheduleModal
      v-if="showReschedule"
      :booking="selectedBooking"
      :new-date="rescheduleDate"
      :new-time="rescheduleTime"
      @close="closeReschedule"
      @rescheduled="handleBookingRescheduled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, isToday, isThisWeek } from 'date-fns'

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

// Components
const QuickBookingModal = defineAsyncComponent(
  () => import('~/components/modals/QuickBookingModal.vue')
)
const RescheduleModal = defineAsyncComponent(
  () => import('~/components/modals/RescheduleModal.vue')
)

// Props & Emits
interface Props {
  bookings?: BookingType[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bookings: () => [],
  loading: false,
})

const emit = defineEmits<{
  dateSelect: [start: Date, end: Date]
  eventClick: [booking: BookingType]
  eventDrop: [booking: BookingType, newStart: Date, newEnd: Date]
  viewChange: [view: string]
}>()

// Composables
const { fetchContractorBookings } = useBookings()
const { success } = useNotifications()

// Reactive state
const calendar = ref()
const currentView = ref('dayGridMonth')
const selectedDate = ref<Date | null>(null)
const selectedTime = ref<string | null>(null)
const selectedBooking = ref<BookingType | null>(null)
const rescheduleDate = ref<Date | null>(null)
const rescheduleTime = ref<string | null>(null)
const showQuickBooking = ref(false)
const showReschedule = ref(false)

// Computed properties
const currentMonth = computed(() => {
  const calendarApi = calendar.value?.getApi()
  if (!calendarApi) return format(new Date(), 'MMMM yyyy')
  return format(calendarApi.getDate(), 'MMMM yyyy')
})

const todayBookings = computed(() => {
  return props.bookings.filter((booking) =>
    isToday(new Date(booking.scheduledAt))
  )
})

const thisWeekBookings = computed(() => {
  return props.bookings.filter((booking) =>
    isThisWeek(new Date(booking.scheduledAt))
  )
})

const availableSlots = computed(() => {
  // Calculate available slots for this week
  // This would be based on working hours and existing bookings
  return 25 // Placeholder
})

const weeklyRevenue = computed(() => {
  return thisWeekBookings.value
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
})

// Calendar configuration
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: currentView.value,
  headerToolbar: {
    left: 'prev,next',
    center: '',
    right: '',
  },
  height: 'auto',
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  editable: true,
  droppable: true,
  events: calendarEvents.value,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  slotDuration: '00:30:00',
  allDaySlot: false,
  nowIndicator: true,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    startTime: '09:00',
    endTime: '18:00',
  },
  eventDisplay: 'block',
  eventBackgroundColor: 'transparent',
  eventBorderColor: 'transparent',
  eventClassNames: 'custom-calendar-event',
}))

const calendarEvents = computed(() => {
  return props.bookings.map((booking) => ({
    id: booking.id.toString(),
    title: booking.service?.title || 'Service',
    start: booking.scheduledAt,
    end: booking.duration
      ? new Date(
          new Date(booking.scheduledAt).getTime() + booking.duration * 60000
        ).toISOString()
      : booking.scheduledAt,
    backgroundColor: getBookingColor(booking.status),
    borderColor: getBookingColor(booking.status),
    textColor: '#ffffff',
    extendedProps: {
      booking,
      status: booking.status,
      clientName: booking.client?.name,
      service: booking.service?.title,
      price: booking.totalPrice,
    },
  }))
})

// Methods
const getBookingColor = (status: string) => {
  const colors = {
    PENDING: '#f59e0b', // amber-500
    CONFIRMED: '#10b981', // emerald-500
    CANCELLED: '#6b7280', // gray-500
    COMPLETED: '#3b82f6', // blue-500
  }
  return colors[status as keyof typeof colors] || colors.PENDING
}

const changeView = (view: string) => {
  currentView.value = view
  const calendarApi = calendar.value?.getApi()
  if (calendarApi) {
    calendarApi.changeView(view)
  }
  emit('viewChange', view)
}

const goToToday = () => {
  const calendarApi = calendar.value?.getApi()
  if (calendarApi) {
    calendarApi.today()
  }
}

const handleDateSelect = (selectInfo: {
  start: Date
  end: Date
  view: { calendar: { unselect: () => void } }
}) => {
  const start = selectInfo.start
  const end = selectInfo.end

  // If it's a time slot selection, open quick booking
  if (currentView.value !== 'dayGridMonth') {
    selectedDate.value = start
    selectedTime.value = format(start, 'HH:mm')
    showQuickBooking.value = true
  }

  emit('dateSelect', start, end)

  // Clear selection
  selectInfo.view.calendar.unselect()
}

const handleEventClick = (clickInfo: {
  event: { extendedProps: { booking: BookingType } }
}) => {
  const booking = clickInfo.event.extendedProps.booking
  selectedBooking.value = booking
  emit('eventClick', booking)
}

const handleEventDrop = (dropInfo: {
  event: { extendedProps: { booking: BookingType }; start: Date; end: Date }
  revert: () => void
}) => {
  const booking = dropInfo.event.extendedProps.booking
  const newStart = dropInfo.event.start

  // Show reschedule modal for confirmation
  selectedBooking.value = booking
  rescheduleDate.value = newStart
  rescheduleTime.value = format(newStart, 'HH:mm')
  showReschedule.value = true

  // Revert the drop temporarily
  dropInfo.revert()
}

const handleEventResize = (_resizeInfo: {
  event: { extendedProps: { booking: BookingType }; end: Date }
}) => {
  // Handle duration update
  success('Duration Updated', 'Booking duration has been updated')
}

const closeQuickBooking = () => {
  showQuickBooking.value = false
  selectedDate.value = null
  selectedTime.value = null
}

const closeReschedule = () => {
  showReschedule.value = false
  selectedBooking.value = null
  rescheduleDate.value = null
  rescheduleTime.value = null
}

const handleBookingCreated = (_booking: BookingType) => {
  success('Booking Created', 'New booking has been added to your calendar')
  closeQuickBooking()
  // Refresh calendar events
  fetchContractorBookings()
}

const handleBookingRescheduled = (_booking: BookingType) => {
  success('Booking Rescheduled', 'Booking has been successfully rescheduled')
  closeReschedule()
  // Refresh calendar events
  fetchContractorBookings()
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    // Calendar will be rendered
  })
})
</script>

<style scoped>
.calendar-container {
  position: relative;
}

:deep(.custom-calendar) {
  --fc-border-color: #d6d3d1;
  --fc-button-text-color: #0f172a;
  --fc-button-bg-color: #f1f5f9;
  --fc-button-border-color: #d6d3d1;
  --fc-button-hover-bg-color: #e2e8f0;
  --fc-button-active-bg-color: #3b82f6;
  --fc-today-bg-color: rgba(59, 130, 246, 0.1);
}

:deep(.fc-toolbar-title) {
  display: none;
}

:deep(.fc-button-group) {
  display: none;
}

:deep(.fc-daygrid-event) {
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 12px;
  font-weight: 500;
}

:deep(.fc-timegrid-event) {
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 11px;
  font-weight: 500;
}

:deep(.fc-event-title) {
  font-weight: 600;
}

:deep(.custom-calendar-event) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.custom-calendar-event:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

:deep(.fc-day-today) {
  background-color: rgba(59, 130, 246, 0.05) !important;
}

:deep(.fc-col-header-cell) {
  background-color: #f1f5f9;
  border-color: #d6d3d1;
}

:deep(.fc-scrollgrid) {
  border-color: #d6d3d1;
}

:deep(.fc-theme-standard td, .fc-theme-standard th) {
  border-color: #d6d3d1;
}
</style>
