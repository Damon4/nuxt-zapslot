<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base-content text-2xl font-bold">
          Time Slot Management
        </h2>
        <p class="text-base-content/70 mt-1">
          Configure your working hours and availability
        </p>
      </div>
      <button class="btn btn-primary" @click="emit('edit-availability')">
        <Icon name="tabler:settings" class="h-4 w-4" />
        Edit Availability
      </button>
    </div>

    <!-- Current Availability Overview -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h3 class="card-title mb-4">
          <Icon name="tabler:clock" class="h-5 w-5" />
          Current Availability
        </h3>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div
            v-for="day in daysOfWeek"
            :key="day.value"
            class="rounded-lg border p-3"
            :class="{
              'border-success bg-success/5': isDayAvailable(day.value),
              'border-base-300 bg-base-200': !isDayAvailable(day.value),
            }"
          >
            <div class="text-center">
              <div class="text-sm font-medium">{{ day.label }}</div>
              <div class="mt-1">
                <template v-if="isDayAvailable(day.value)">
                  <div class="text-success text-xs">Available</div>
                  <div class="text-base-content/70 text-xs">
                    {{ getDayHours(day.value) }}
                  </div>
                </template>
                <template v-else>
                  <div class="text-base-content/50 text-xs">Unavailable</div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Blocked Time Slots -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="card-title">
            <Icon name="tabler:ban" class="h-5 w-5" />
            Blocked Time Slots
          </h3>
          <button class="btn btn-outline btn-sm" @click="emit('block-time')">
            <Icon name="tabler:plus" class="h-4 w-4" />
            Block Time
          </button>
        </div>

        <div v-if="blockedSlots.length === 0" class="py-8 text-center">
          <Icon
            name="tabler:calendar-off"
            class="text-base-content/30 mx-auto mb-2 h-12 w-12"
          />
          <p class="text-base-content/50">No blocked time slots</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="slot in blockedSlots"
            :key="slot.id"
            class="border-error/20 bg-error/5 flex items-center justify-between rounded-lg border p-3"
          >
            <div class="flex items-center gap-3">
              <Icon name="tabler:clock-x" class="text-error h-5 w-5" />
              <div>
                <div class="font-medium">
                  {{ formatDate(slot.date) }}
                </div>
                <div class="text-base-content/70 text-sm">
                  {{ slot.startTime }} - {{ slot.endTime }}
                </div>
                <div v-if="slot.reason" class="text-base-content/50 text-xs">
                  {{ slot.reason }}
                </div>
              </div>
            </div>
            <button
              class="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
              @click="removeBlockedSlot(slot.id)"
            >
              <Icon name="tabler:trash" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Availability Statistics -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h3 class="card-title mb-4">
          <Icon name="tabler:chart-bar" class="h-5 w-5" />
          Availability Statistics
        </h3>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Working Days</div>
            <div class="stat-value text-primary">{{ availableDaysCount }}</div>
            <div class="stat-desc">Per week</div>
          </div>

          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Total Hours</div>
            <div class="stat-value text-success">{{ totalWeeklyHours }}</div>
            <div class="stat-desc">Per week</div>
          </div>

          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Blocked Slots</div>
            <div class="stat-value text-warning">{{ blockedSlots.length }}</div>
            <div class="stat-desc">Currently active</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Availability Editor Modal -->
    <AvailabilityEditorModal
      v-if="showAvailabilityEditor"
      :availability="availability"
      @close="showAvailabilityEditor = false"
      @saved="handleAvailabilitySaved"
    />

    <!-- Block Time Modal -->
    <BlockTimeModal
      v-if="showBlockTimeModal"
      @close="showBlockTimeModal = false"
      @blocked="handleTimeBlocked"
    />
  </div>
</template>

<script setup lang="ts">
// Import modal components
import AvailabilityEditorModal from '~/components/modals/AvailabilityEditorModal.vue'
import BlockTimeModal from '~/components/modals/BlockTimeModal.vue'

// Emits
const emit = defineEmits<{
  'edit-availability': []
  'block-time': []
  'refresh-data': []
}>()

interface AvailabilityType {
  id?: number
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

interface Props {
  availability?: AvailabilityType[]
  blockedSlots?: BlockedSlotType[]
}

const props = withDefaults(defineProps<Props>(), {
  availability: () => [],
  blockedSlots: () => [],
})

// Composables
const { success, error } = useNotifications()

// Reactive state
const showAvailabilityEditor = ref(false)
const showBlockTimeModal = ref(false)

// Static data
const daysOfWeek = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
]

// Computed
const availableDaysCount = computed(() => {
  return props.availability.filter((a) => a.isAvailable).length
})

const totalWeeklyHours = computed(() => {
  return props.availability
    .filter((a) => a.isAvailable)
    .reduce((total, day) => {
      const start = new Date(`2000-01-01T${day.startTime}:00`)
      const end = new Date(`2000-01-01T${day.endTime}:00`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + hours
    }, 0)
})

// Methods
const isDayAvailable = (dayOfWeek: number): boolean => {
  const dayAvailability = props.availability.find(
    (a) => a.dayOfWeek === dayOfWeek
  )
  return dayAvailability?.isAvailable ?? false
}

const getDayHours = (dayOfWeek: number): string => {
  const dayAvailability = props.availability.find(
    (a) => a.dayOfWeek === dayOfWeek
  )
  if (!dayAvailability || !dayAvailability.isAvailable) {
    return ''
  }
  return `${dayAvailability.startTime} - ${dayAvailability.endTime}`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const removeBlockedSlot = async (slotId: number) => {
  try {
    await $fetch(`/api/contractor/calendar/block-time/${slotId}`, {
      method: 'DELETE',
    })

    success('Time Slot Unblocked', 'Time slot is now available for booking')
    // Emit event to parent to refresh data
    emit('refresh-data')
  } catch (err: unknown) {
    console.error('Error removing blocked slot:', err)
    error('Unblock Failed', 'Failed to unblock time slot')
  }
}

const handleAvailabilitySaved = (_newAvailability: AvailabilityType[]) => {
  success('Availability Updated', 'Your availability settings have been saved')
  // Emit event to parent component
  emit('refresh-data')
}

const handleTimeBlocked = (_blockedSlot: BlockedSlotType) => {
  success('Time Blocked', 'Time slot has been blocked successfully')
  emit('refresh-data')
}
</script>

<style scoped>
/* Custom styles for time slot manager */
.stat {
  padding: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-7 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
