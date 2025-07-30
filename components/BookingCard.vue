<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

// Define interface that matches the API response
interface BookingProp {
  id: number
  serviceId: number
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
    price?: number
    priceType: string
    contractor?: {
      user: {
        name: string
        image?: string
      }
    }
  }
}

interface Props {
  booking: BookingProp
}

const props = defineProps<Props>()

// Composables
// (removed unused imports for cleaner code)

// Computed
const statusConfig = computed(() => {
  const configs = {
    PENDING: {
      badge: 'badge-warning',
      icon: 'tabler:clock',
      text: 'Pending',
      description: 'Waiting for contractor confirmation',
    },
    CONFIRMED: {
      badge: 'badge-success',
      icon: 'tabler:check',
      text: 'Confirmed',
      description: 'Confirmed by contractor',
    },
    CANCELLED: {
      badge: 'badge-error',
      icon: 'tabler:x',
      text: 'Cancelled',
      description: 'Booking was cancelled',
    },
    COMPLETED: {
      badge: 'badge-info',
      icon: 'tabler:check',
      text: 'Completed',
      description: 'Service completed',
    },
  }
  return configs[props.booking.status]
})

const isUpcoming = ref(false)
const canCancel = ref(false)

// Client-side only date computations to prevent hydration mismatch
onMounted(() => {
  isUpcoming.value = new Date(props.booking.scheduledAt) > new Date()

  if (
    props.booking.status !== 'PENDING' &&
    props.booking.status !== 'CONFIRMED'
  ) {
    canCancel.value = false
  } else {
    // Can cancel if booking is at least 2 hours in the future
    const scheduledTime = new Date(props.booking.scheduledAt)
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000)
    canCancel.value = scheduledTime > twoHoursFromNow
  }
})

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

// Emits
const emit = defineEmits<{
  cancel: [bookingId: number]
  contact: [bookingId: number]
  viewDetails: [bookingId: number]
}>()
</script>

<template>
  <div class="card bg-base-100 shadow-lg transition-shadow hover:shadow-xl">
    <div class="card-body">
      <!-- Header with status -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="card-title text-lg">
            {{ booking.service?.title || 'Service' }}
          </h3>
          <div class="text-base-content/70 text-sm">
            {{ booking.service?.category || 'N/A' }}
          </div>
        </div>
        <div class="text-right">
          <div :class="['badge', statusConfig.badge, 'mb-2']">
            <Icon :name="statusConfig.icon" class="mr-1 h-3 w-3" />
            {{ statusConfig.text }}
          </div>
          <div class="text-base-content/60 text-sm">
            {{ statusConfig.description }}
          </div>
        </div>
      </div>

      <!-- Booking details -->
      <div class="my-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <Icon name="tabler:calendar" class="text-primary h-4 w-4" />
            <span class="font-medium">Scheduled Date</span>
          </div>
          <div class="text-base-content/80">
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

        <div>
          <div class="mb-2 flex items-center gap-2">
            <Icon name="tabler:clock" class="text-primary h-4 w-4" />
            <span class="font-medium">Duration & Price</span>
          </div>
          <div class="text-base-content/80">
            {{ formatDuration(booking.duration) }} • ${{
              booking.totalPrice || 'N/A'
            }}
          </div>
          <div class="text-base-content/60 text-sm">
            {{ booking.service?.priceType?.toLowerCase() || 'fixed' }} price
          </div>
        </div>
      </div>

      <!-- Contractor info -->
      <div
        v-if="booking.service?.contractor?.user"
        class="bg-base-200 rounded-lg p-3"
      >
        <div class="flex items-center gap-3">
          <div class="avatar">
            <div class="bg-primary w-10 rounded-full">
              <img
                v-if="booking.service.contractor.user.image"
                :src="booking.service.contractor.user.image"
                :alt="booking.service.contractor.user.name"
                class="rounded-full"
              >
              <div
                v-else
                class="text-primary-content flex h-full w-full items-center justify-center text-sm font-bold"
              >
                {{ getInitials(booking.service.contractor.user.name) }}
              </div>
            </div>
          </div>
          <div class="flex-1">
            <div class="font-medium">
              {{ booking.service.contractor.user.name }}
            </div>
            <div class="text-base-content/60 text-sm">Contractor</div>
          </div>
          <button
            class="btn btn-sm btn-outline"
            @click="emit('contact', booking.id)"
          >
            <Icon name="tabler:message" class="h-4 w-4" />
            Contact
          </button>
        </div>
      </div>

      <!-- Notes (if any) -->
      <div v-if="booking.notes" class="bg-base-200 rounded-lg p-3">
        <div class="mb-2 flex items-center gap-2">
          <Icon name="tabler:note" class="text-primary h-4 w-4" />
          <span class="text-sm font-medium">Special Notes</span>
        </div>
        <div class="text-base-content/80 text-sm">
          {{ booking.notes }}
        </div>
      </div>

      <!-- Actions -->
      <div class="card-actions mt-4 justify-end gap-2">
        <button
          class="btn btn-sm btn-outline"
          @click="emit('viewDetails', booking.id)"
        >
          <Icon name="tabler:eye" class="h-4 w-4" />
          View Details
        </button>

        <button
          v-if="canCancel"
          class="btn btn-sm btn-error btn-outline"
          @click="emit('cancel', booking.id)"
        >
          <Icon name="tabler:x" class="h-4 w-4" />
          Cancel
        </button>

        <div
          v-else-if="!isUpcoming && booking.status === 'COMPLETED'"
          class="badge badge-success"
        >
          <Icon name="tabler:check" class="mr-1 h-3 w-3" />
          Completed
        </div>
      </div>

      <!-- Booking metadata -->
      <div
        class="text-base-content/50 border-base-300 mt-2 border-t pt-2 text-xs"
      >
        Booking #{{ booking.id }} • Created
        <NuxtTime :datetime="booking.createdAt" relative />
      </div>
    </div>
  </div>
</template>
