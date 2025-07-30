<script setup lang="ts">
import { ref, computed } from 'vue'

interface Booking {
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
  service?: {
    title: string
    category: string
  }
  client?: {
    name: string
    email: string
    image?: string
  }
}

// Props
interface Props {
  bookings: Booking[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Emits
const emit = defineEmits<{
  updateStatus: [
    bookingId: number,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ]
  bulkAction: [bookingIds: number[], action: string]
  refresh: []
}>()

// State
const selectedBookings = ref<Set<number>>(new Set())
const showBulkActions = ref(false)
const processingBulk = ref(false)

// Computed
const allSelected = computed(() => {
  return (
    props.bookings.length > 0 &&
    selectedBookings.value.size === props.bookings.length
  )
})

const someSelected = computed(() => {
  return (
    selectedBookings.value.size > 0 &&
    selectedBookings.value.size < props.bookings.length
  )
})

const hasSelected = computed(() => {
  return selectedBookings.value.size > 0
})

const selectedBookingsList = computed(() => {
  return props.bookings.filter((b) => selectedBookings.value.has(b.id))
})

const canConfirmSelected = computed(() => {
  return selectedBookingsList.value.every((b) => b.status === 'PENDING')
})

const canCancelSelected = computed(() => {
  return selectedBookingsList.value.every(
    (b) => b.status === 'PENDING' || b.status === 'CONFIRMED'
  )
})

const canCompleteSelected = computed(() => {
  return selectedBookingsList.value.every((b) => b.status === 'CONFIRMED')
})

// Methods
const toggleAll = () => {
  if (allSelected.value) {
    selectedBookings.value.clear()
  } else {
    props.bookings.forEach((booking) => {
      selectedBookings.value.add(booking.id)
    })
  }
}

const toggleBooking = (bookingId: number) => {
  if (selectedBookings.value.has(bookingId)) {
    selectedBookings.value.delete(bookingId)
  } else {
    selectedBookings.value.add(bookingId)
  }
}

const clearSelection = () => {
  selectedBookings.value.clear()
  showBulkActions.value = false
}

const handleBulkAction = async (action: string) => {
  if (selectedBookings.value.size === 0) return

  try {
    processingBulk.value = true
    const bookingIds = Array.from(selectedBookings.value)
    await emit('bulkAction', bookingIds, action)
    clearSelection()
  } finally {
    processingBulk.value = false
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'badge-warning'
    case 'CONFIRMED':
      return 'badge-success'
    case 'CANCELLED':
      return 'badge-error'
    case 'COMPLETED':
      return 'badge-info'
    default:
      return 'badge-outline'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'tabler:clock'
    case 'CONFIRMED':
      return 'tabler:check'
    case 'CANCELLED':
      return 'tabler:x'
    case 'COMPLETED':
      return 'tabler:check-circle'
    default:
      return 'tabler:question-mark'
  }
}

const formatPrice = (price?: number) => {
  return price ? `$${price}` : 'N/A'
}

const formatDuration = (minutes?: number) => {
  if (!minutes) return 'N/A'
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

// Watch for selection changes to show/hide bulk actions
watch(hasSelected, (value) => {
  showBulkActions.value = value
})
</script>

<template>
  <div class="space-y-4">
    <!-- Bulk Actions Bar -->
    <Transition name="slide-down">
      <div
        v-if="showBulkActions"
        class="card bg-primary text-primary-content shadow-lg"
      >
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <Icon name="tabler:select" class="h-5 w-5" />
              <span class="font-medium">
                {{ selectedBookings.size }} booking{{
                  selectedBookings.size !== 1 ? 's' : ''
                }}
                selected
              </span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Bulk Actions -->
              <button
                v-if="canConfirmSelected"
                class="btn btn-sm btn-success"
                :disabled="processingBulk"
                @click="handleBulkAction('CONFIRMED')"
              >
                <Icon name="tabler:check" class="h-4 w-4" />
                Confirm All
              </button>

              <button
                v-if="canCompleteSelected"
                class="btn btn-sm btn-info"
                :disabled="processingBulk"
                @click="handleBulkAction('COMPLETED')"
              >
                <Icon name="tabler:check-circle" class="h-4 w-4" />
                Complete All
              </button>

              <button
                v-if="canCancelSelected"
                class="btn btn-sm btn-error"
                :disabled="processingBulk"
                @click="handleBulkAction('CANCELLED')"
              >
                <Icon name="tabler:x" class="h-4 w-4" />
                Cancel All
              </button>

              <button class="btn btn-sm btn-ghost" @click="clearSelection">
                <Icon name="tabler:x" class="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          <div v-if="processingBulk" class="flex items-center gap-2 text-sm">
            <span class="loading loading-spinner loading-sm" />
            Processing bulk action...
          </div>
        </div>
      </div>
    </Transition>

    <!-- Table Header -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <label>
                    <input
                      type="checkbox"
                      class="checkbox"
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      @change="toggleAll"
                    >
                  </label>
                </th>
                <th>Service & Client</th>
                <th>Schedule</th>
                <th>Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="6" class="py-8 text-center">
                  <span class="loading loading-spinner loading-lg" />
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="bookings.length === 0">
                <td colspan="6" class="py-8 text-center">
                  <div class="text-base-content/50">
                    <Icon
                      name="tabler:calendar-off"
                      class="mx-auto mb-2 h-12 w-12"
                    />
                    <p>No bookings found</p>
                  </div>
                </td>
              </tr>

              <!-- Booking Rows -->
              <tr
                v-for="booking in bookings"
                :key="booking.id"
                :class="{ 'bg-primary/5': selectedBookings.has(booking.id) }"
                class="hover"
              >
                <!-- Selection -->
                <td>
                  <label>
                    <input
                      type="checkbox"
                      class="checkbox"
                      :checked="selectedBookings.has(booking.id)"
                      @change="toggleBooking(booking.id)"
                    >
                  </label>
                </td>

                <!-- Service & Client -->
                <td>
                  <div class="space-y-1">
                    <div class="font-medium">
                      {{ booking.service?.title || 'Unknown Service' }}
                    </div>
                    <div class="text-base-content/70 text-sm">
                      {{ booking.service?.category }}
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <Icon name="tabler:user" class="h-3 w-3" />
                      {{ booking.client?.name || 'Unknown Client' }}
                    </div>
                  </div>
                </td>

                <!-- Schedule -->
                <td>
                  <div class="space-y-1">
                    <div class="font-medium">
                      <NuxtTime
                        :datetime="booking.scheduledAt"
                        day="2-digit"
                        month="2-digit"
                        year="numeric"
                      />
                    </div>
                    <div class="text-base-content/70 text-sm">
                      <NuxtTime
                        :datetime="booking.scheduledAt"
                        hour="2-digit"
                        minute="2-digit"
                      />
                    </div>
                    <div class="text-base-content/50 text-xs">
                      <NuxtTime :datetime="booking.scheduledAt" relative />
                    </div>
                  </div>
                </td>

                <!-- Details -->
                <td>
                  <div class="space-y-1">
                    <div class="text-sm">
                      <Icon name="tabler:clock" class="mr-1 inline h-3 w-3" />
                      {{ formatDuration(booking.duration) }}
                    </div>
                    <div class="text-sm">
                      <Icon
                        name="tabler:currency-dollar"
                        class="mr-1 inline h-3 w-3"
                      />
                      {{ formatPrice(booking.totalPrice) }}
                    </div>
                    <div
                      v-if="booking.notes"
                      class="text-base-content/50 max-w-xs truncate text-xs"
                      :title="booking.notes"
                    >
                      <Icon name="tabler:note" class="mr-1 inline h-3 w-3" />
                      {{ booking.notes }}
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <div :class="['badge', getStatusBadgeClass(booking.status)]">
                    <Icon
                      :name="getStatusIcon(booking.status)"
                      class="mr-1 h-3 w-3"
                    />
                    {{ booking.status }}
                  </div>
                </td>

                <!-- Actions -->
                <td>
                  <div class="flex gap-1">
                    <!-- Confirm -->
                    <button
                      v-if="booking.status === 'PENDING'"
                      class="btn btn-xs btn-success"
                      @click="emit('updateStatus', booking.id, 'CONFIRMED')"
                    >
                      <Icon name="tabler:check" class="h-3 w-3" />
                    </button>

                    <!-- Complete -->
                    <button
                      v-if="booking.status === 'CONFIRMED'"
                      class="btn btn-xs btn-info"
                      @click="emit('updateStatus', booking.id, 'COMPLETED')"
                    >
                      <Icon name="tabler:check-circle" class="h-3 w-3" />
                    </button>

                    <!-- Cancel -->
                    <button
                      v-if="
                        booking.status === 'PENDING' ||
                        booking.status === 'CONFIRMED'
                      "
                      class="btn btn-xs btn-error"
                      @click="emit('updateStatus', booking.id, 'CANCELLED')"
                    >
                      <Icon name="tabler:x" class="h-3 w-3" />
                    </button>

                    <!-- View Details -->
                    <button class="btn btn-xs btn-outline">
                      <Icon name="tabler:eye" class="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
