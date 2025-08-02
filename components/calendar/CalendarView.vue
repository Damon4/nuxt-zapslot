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
        <div class="stat-value text-accent text-2xl">
          ${{
            Number(weeklyRevenue).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }}
        </div>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
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

interface AvailabilityType {
  id?: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface BlockedSlotType {
  id: number
  contractorId?: string | number
  date: string // ISO format from API
  startTime: string
  endTime: string
  reason?: string
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
  availability?: AvailabilityType[]
  blockedSlots?: BlockedSlotType[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bookings: () => [],
  availability: () => [],
  blockedSlots: () => [],
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

// Computed business hours based on contractor availability
const businessHours = computed(() => {
  if (!props.availability || props.availability.length === 0) {
    // Default business hours if no availability data
    return [
      {
        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
        startTime: '09:00',
        endTime: '18:00',
      },
    ]
  }

  // Convert availability data to business hours format
  const availableDays = props.availability.filter((a) => a.isAvailable)

  if (availableDays.length === 0) {
    return [] // No available days
  }

  // Group by similar time slots
  const timeGroups: { [key: string]: number[] } = {}

  availableDays.forEach((day) => {
    const timeKey = `${day.startTime}-${day.endTime}`
    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = []
    }
    timeGroups[timeKey].push(day.dayOfWeek)
  })

  // Convert to business hours format
  const businessHoursResult = Object.entries(timeGroups).map(
    ([timeKey, days]) => {
      const [startTime, endTime] = timeKey.split('-')
      return {
        daysOfWeek: days.sort((a, b) => a - b),
        startTime,
        endTime,
      }
    }
  )

  return businessHoursResult
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

    // Update events to reflect view-dependent display style
    nextTick(() => {
      calendarApi.removeAllEvents()
      const events = calendarEvents.value
      calendarApi.setOption('events', events)
    })
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleEventClick = (clickInfo: any) => {
  if (clickInfo.event.extendedProps?.booking) {
    const booking = clickInfo.event.extendedProps.booking
    selectedBooking.value = booking
    emit('eventClick', booking)
  }
}

// Calendar configuration function
const getCalendarOptions = () => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  firstDay: 1, // Start week on Monday
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  businessHours: businessHours.value,
  selectConstraint: 'businessHours',
  eventConstraint: 'businessHours',
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  height: 'auto',
  contentHeight: 600,
  select: handleDateSelect,
  eventClick: handleEventClick,
  events: [], // Initialize empty, will be updated by watcher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dayCellDidMount: (info: any) => {
    // Style non-working days
    const dayOfWeek = info.date.getDay()
    const dayOfWeekISO = dayOfWeek === 0 ? 7 : dayOfWeek // Convert Sunday from 0 to 7

    const isWorkingDay = props.availability?.some(
      (a) => a.dayOfWeek === dayOfWeekISO && a.isAvailable
    )

    if (!isWorkingDay && props.availability && props.availability.length > 0) {
      info.el.style.backgroundColor = '#f3f4f6'
      info.el.style.opacity = '0.6'
    }
  },
})

// Calendar options reactive property
const calendarOptions = ref(getCalendarOptions())

const calendarEvents = computed(() => {
  const bookingEvents = props.bookings.map((booking) => ({
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
      type: 'booking',
    },
  }))

  // Add blocked slots as background events
  const blockedEvents = props.blockedSlots.map((slot) => {
    // Convert ISO date string to YYYY-MM-DD format
    const dateStr = new Date(slot.date).toISOString().split('T')[0]

    // In month view, show as regular events; in time views, show as background
    const isMonthView = currentView.value === 'dayGridMonth'

    return {
      id: `blocked-${slot.id}`,
      title: slot.reason || 'Blocked Time',
      start: `${dateStr}T${slot.startTime}:00`,
      end: `${dateStr}T${slot.endTime}:00`,
      display: isMonthView ? 'block' : 'background',
      backgroundColor: isMonthView ? '#dc2626' : '#fee2e2', // Solid red for month, light red for time views
      borderColor: isMonthView ? '#dc2626' : '#fca5a5',
      textColor: '#ffffff',
      extendedProps: {
        blockedSlot: slot,
        type: 'blocked',
        reason: slot.reason,
      },
    }
  })

  return [...bookingEvents, ...blockedEvents]
})

const _handleEventDrop = (dropInfo: {
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

const _handleEventResize = (_resizeInfo: {
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

const handleBookingCreated = (_booking: unknown) => {
  success('Booking Created', 'New booking has been added to your calendar')
  closeQuickBooking()
  // Refresh calendar events
  fetchContractorBookings()
}

const handleBookingRescheduled = (_booking: unknown) => {
  success('Booking Rescheduled', 'Booking has been successfully rescheduled')
  closeReschedule()
  // Refresh calendar events
  fetchContractorBookings()
}

// Watch for data changes and update calendar
watch(
  [() => props.bookings, () => props.availability, () => props.blockedSlots],
  () => {
    nextTick(() => {
      const calendarApi = calendar.value?.getApi()
      if (calendarApi) {
        // Update business hours
        calendarApi.setOption('businessHours', businessHours.value)

        // Update events - use setOption instead of addEventSource
        calendarApi.removeAllEvents()
        const events = calendarEvents.value
        calendarApi.setOption('events', events)
      }
    })
  },
  { deep: true, immediate: true }
)

// Lifecycle
onMounted(() => {
  nextTick(() => {
    // Calendar initialization complete
  })
})
</script>

<style scoped>
.calendar-container {
  position: relative;
}

:deep(.custom-calendar) {
  --fc-border-color: #374151;
  --fc-button-text-color: #f9fafb;
  --fc-button-bg-color: #374151;
  --fc-button-border-color: #374151;
  --fc-button-hover-bg-color: #4b5563;
  --fc-button-active-bg-color: #3b82f6;
  --fc-today-bg-color: rgba(59, 130, 246, 0.2);
  --fc-day-other-bg-color: #1f2937;
  --fc-non-business-color: rgba(31, 41, 55, 0.8);
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
  background-color: #374151 !important;
  border-color: #4b5563 !important;
  color: #f9fafb !important;
  font-weight: 600;
}

:deep(.fc-col-header-cell a) {
  color: #f9fafb !important;
  text-decoration: none;
}

:deep(.fc-daygrid-day) {
  background-color: #111827 !important;
  color: #f9fafb !important;
  border-color: #374151 !important;
}

:deep(.fc-daygrid-day-number) {
  color: #f9fafb !important;
  font-weight: 500;
  padding: 8px;
}

:deep(.fc-day-other .fc-daygrid-day-number) {
  color: #6b7280 !important;
}

:deep(.fc-day-disabled) {
  background-color: #1f2937 !important;
  color: #4b5563 !important;
}

:deep(.fc-day-disabled .fc-daygrid-day-number) {
  color: #4b5563 !important;
}

:deep(.fc-scrollgrid) {
  border-color: #374151 !important;
}

:deep(.fc-theme-standard td, .fc-theme-standard th) {
  border-color: #374151 !important;
}

/* Weekend days styling */
:deep(.fc-day-sat, .fc-day-sun) {
  background-color: #1f2937 !important;
  opacity: 0.6;
}

:deep(.fc-day-sat .fc-daygrid-day-number, .fc-day-sun .fc-daygrid-day-number) {
  color: #6b7280 !important;
  font-style: italic;
}

/* Business hours vs non-business styling */
:deep(.fc-non-business) {
  background-color: #1f2937 !important;
  opacity: 0.7;
}

/* Past days styling */
:deep(.fc-day-past:not(.fc-day-today)) {
  opacity: 0.5;
}

:deep(.fc-day-past:not(.fc-day-today) .fc-daygrid-day-number) {
  color: #4b5563 !important;
}

/* Today highlighting */
:deep(.fc-day-today) {
  background-color: rgba(59, 130, 246, 0.2) !important;
  border-color: #3b82f6 !important;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  color: #60a5fa !important;
  font-weight: 700;
  background-color: rgba(59, 130, 246, 0.3);
  border-radius: 6px;
}
</style>
