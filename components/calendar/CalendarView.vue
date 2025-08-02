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
      <div class="card-body p-0">
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
  headerToolbar: false as const, // Hide the default toolbar
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
      info.el.style.backgroundColor = 'var(--color-base-200)'
      info.el.style.opacity = '0.6'
      info.el.style.backgroundImage =
        'repeating-linear-gradient(45deg, transparent, transparent 10px, color-mix(in srgb, var(--color-base-300) 40%, transparent) 10px, color-mix(in srgb, var(--color-base-300) 40%, transparent) 20px)'
      info.el.style.position = 'relative'
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventDidMount: (info: any) => {
    // Add data attributes for styling
    if (info.event.extendedProps?.booking) {
      info.el.setAttribute('data-status', info.event.extendedProps.status)
    }
    if (info.event.extendedProps?.type === 'blocked') {
      info.el.setAttribute('data-type', 'blocked')
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
      backgroundColor: isMonthView
        ? '#9ca3af'
        : 'color-mix(in srgb, var(--color-neutral) 25%, transparent)', // Gray-400 for month, neutral-25% for time views
      borderColor: isMonthView
        ? '#6b7280'
        : 'color-mix(in srgb, var(--color-neutral) 35%, transparent)', // Gray-500 border for month, neutral-35% for time views
      textColor: isMonthView ? '#ffffff' : 'var(--color-base-content)', // White for month, base-content for time views
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
  --fc-border-color: var(--color-base-300);
  --fc-button-text-color: var(--color-base-content);
  --fc-button-bg-color: var(--color-base-100);
  --fc-button-border-color: var(--color-base-300);
  --fc-button-hover-bg-color: var(--color-base-200);
  --fc-button-active-bg-color: var(--color-primary);
  --fc-today-bg-color: color-mix(
    in srgb,
    var(--color-primary) 10%,
    transparent
  );
  --fc-day-other-bg-color: var(--color-base-200);
  --fc-non-business-color: color-mix(
    in srgb,
    var(--color-base-300) 50%,
    transparent
  );
}

/* Force FullCalendar to use theme colors for header */
:deep(.custom-calendar .fc-scrollgrid-sync-table) {
  background: var(--color-base-100) !important;
}

:deep(.custom-calendar .fc-scrollgrid) {
  border-color: var(--color-base-300) !important;
  background: var(--color-base-100) !important;
}

/* Header background and text visibility */
:deep(.custom-calendar .fc-col-header) {
  background-color: var(--color-base-200) !important;
  border-bottom: 2px solid var(--color-base-300) !important;
}

:deep(.custom-calendar .fc-scrollgrid-section-header) {
  background-color: var(--color-base-200) !important;
}

:deep(.custom-calendar .fc-scrollgrid-section-header > *) {
  background-color: var(--color-base-200) !important;
}

:deep(.fc-toolbar-title) {
  display: none;
}

/* Hide default FullCalendar buttons, we use our own */
:deep(.fc-button-group) {
  display: none;
}

/* But show our custom view buttons */
.btn-group {
  display: flex !important;
}

:deep(.fc-daygrid-event) {
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 500;
  margin: 1px 2px;
  border: 1px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.fc-timegrid-event) {
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

:deep(.custom-calendar .fc-theme-standard .fc-col-header-cell) {
  background-color: var(--color-base-200) !important;
  border-color: var(--color-base-300) !important;
  color: var(--color-base-content) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.05em;
  padding: 10px 8px;
}

/* Separate styling for th elements with stronger background */
:deep(.custom-calendar .fc-theme-standard th) {
  background-color: var(--color-base-200) !important;
  border-color: var(--color-base-300) !important;
  color: var(--color-base-content) !important;
}

/* Force header row background */
:deep(
  .custom-calendar
    .fc-theme-standard
    .fc-scrollgrid-section-header
    .fc-scrollgrid-sync-table
) {
  background-color: var(--color-base-200) !important;
}

:deep(.custom-calendar .fc-theme-standard .fc-col-header-cell a) {
  color: var(--color-base-content) !important;
  text-decoration: none;
  font-weight: 600;
}

:deep(.custom-calendar .fc-theme-standard .fc-col-header-cell-cushion) {
  color: var(--color-base-content) !important;
  font-weight: 600;
}

/* Enhanced header text contrast */
:deep(.custom-calendar .fc-col-header-cell .fc-col-header-cell-cushion) {
  color: var(--color-base-content) !important;
  font-weight: 700 !important;
  text-shadow: 0 1px 2px hsla(var(--color-base-content), 0.2);
}

:deep(.custom-calendar .fc-theme-standard .fc-daygrid-day) {
  background-color: var(--color-base-100) !important;
  color: var(--color-base-content) !important;
  border-color: var(--color-base-300) !important;
}

:deep(.custom-calendar .fc-theme-standard .fc-daygrid-day-number) {
  color: var(--color-base-content) !important;
  font-weight: 500;
  padding: 8px;
  transition: all 0.2s ease;
}

:deep(.custom-calendar .fc-theme-standard .fc-daygrid-day-number:hover) {
  background-color: var(--color-base-200);
  border-radius: 6px;
}

:deep(
  .custom-calendar .fc-theme-standard .fc-day-other .fc-daygrid-day-number
) {
  color: color-mix(
    in srgb,
    var(--color-base-content) 60%,
    transparent
  ) !important;
  opacity: 0.6;
}

/* Disabled/non-working days styling */
:deep(.fc-day-disabled) {
  background-color: var(--color-base-200) !important;
  color: color-mix(
    in srgb,
    var(--color-base-content) 60%,
    transparent
  ) !important;
}

:deep(.fc-day-disabled .fc-daygrid-day-number) {
  color: color-mix(
    in srgb,
    var(--color-base-content) 50%,
    transparent
  ) !important;
  opacity: 0.5;
}

:deep(.fc-scrollgrid) {
  border-color: var(--color-base-300) !important;
}

:deep(.fc-theme-standard td, .fc-theme-standard th) {
  border-color: var(--color-base-300) !important;
}

/* Weekend days styling - but not today */
:deep(.fc-day-sat:not(.fc-day-today), .fc-day-sun:not(.fc-day-today)) {
  background-color: var(--color-base-200) !important;
  opacity: 0.8;
}

:deep(
  .fc-day-sat:not(.fc-day-today) .fc-daygrid-day-number,
  .fc-day-sun:not(.fc-day-today) .fc-daygrid-day-number
) {
  color: color-mix(
    in srgb,
    var(--color-base-content) 70%,
    transparent
  ) !important;
  font-style: italic;
}

/* Business hours vs non-business styling */
:deep(.fc-non-business) {
  background-color: var(--color-base-200) !important;
  opacity: 0.6;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    color-mix(in srgb, var(--color-base-300) 40%, transparent) 10px,
    color-mix(in srgb, var(--color-base-300) 40%, transparent) 20px
  );
}

/* Past days styling */
:deep(.fc-day-past:not(.fc-day-today)) {
  opacity: 0.4;
  background-color: var(--color-base-200) !important;
}

:deep(.fc-day-past:not(.fc-day-today) .fc-daygrid-day-number) {
  color: color-mix(
    in srgb,
    var(--color-base-content) 60%,
    transparent
  ) !important;
}

/* Today highlighting - highest priority */
:deep(.custom-calendar .fc-theme-standard .fc-day-today) {
  background-color: color-mix(
    in srgb,
    var(--color-primary) 8%,
    transparent
  ) !important;
  border-color: var(--color-primary) !important;
  position: relative;
  opacity: 1 !important; /* Override weekend opacity */
}

:deep(
  .custom-calendar .fc-theme-standard .fc-day-today .fc-daygrid-day-number
) {
  color: var(--color-primary-content) !important;
  font-weight: 700;
  background-color: var(--color-primary);
  color: var(--color-primary-content) !important;
  border-radius: 8px;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
  font-style: normal !important; /* Override weekend italic */
}

/* Blocked slots styling */
:deep(.fc-event[data-event-id^='blocked-']) {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 3px,
    color-mix(in srgb, var(--color-base-content) 10%, transparent) 3px,
    color-mix(in srgb, var(--color-base-content) 10%, transparent) 6px
  );
  opacity: 0.8;
}

:deep(.fc-event[data-event-id^='blocked-'] .fc-event-title) {
  font-style: italic;
  font-size: 10px;
  opacity: 0.9;
  font-weight: 500;
}

/* Background blocked events in time views */
:deep(.fc-bg-event[data-event-id^='blocked-']) {
  background-color: color-mix(
    in srgb,
    var(--color-neutral) 20%,
    transparent
  ) !important;
  border-color: color-mix(
    in srgb,
    var(--color-neutral) 30%,
    transparent
  ) !important;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    color-mix(in srgb, var(--color-neutral) 10%, transparent) 8px,
    color-mix(in srgb, var(--color-neutral) 10%, transparent) 16px
  ) !important;
  opacity: 0.6 !important;
}

/* Blocked time slots in timegrid views */
:deep(.fc-timegrid .fc-bg-event[data-event-id^='blocked-']) {
  background-color: color-mix(
    in srgb,
    var(--color-neutral) 25%,
    transparent
  ) !important;
  border: 1px solid color-mix(in srgb, var(--color-neutral) 35%, transparent) !important;
  border-radius: 4px;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 6px,
    color-mix(in srgb, var(--color-base-content) 8%, transparent) 6px,
    color-mix(in srgb, var(--color-base-content) 8%, transparent) 12px
  ) !important;
}

/* Booking status colors */
:deep(.fc-event[data-status='PENDING']) {
  background-color: #f59e0b !important;
  border-color: #d97706 !important;
}

:deep(.fc-event[data-status='CONFIRMED']) {
  background-color: #10b981 !important;
  border-color: #059669 !important;
}

:deep(.fc-event[data-status='CANCELLED']) {
  background-color: #6b7280 !important;
  border-color: #4b5563 !important;
}

:deep(.fc-event[data-status='COMPLETED']) {
  background-color: #3b82f6 !important;
  border-color: #2563eb !important;
}
</style>
