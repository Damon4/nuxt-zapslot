<template>
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl">
      <form @submit.prevent="handleSubmit">
        <!-- Modal Header -->
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-lg font-bold">Create Quick Booking</h3>
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost"
            @click="$emit('close')"
          >
            <Icon name="tabler:x" class="h-4 w-4" />
          </button>
        </div>

        <!-- Selected Date/Time -->
        <div class="bg-primary/10 mb-6 rounded-lg p-4">
          <div class="text-primary flex items-center gap-2">
            <Icon name="tabler:calendar-event" class="h-5 w-5" />
            <span class="font-medium">Selected Time Slot</span>
          </div>
          <div class="mt-2">
            <div class="text-lg font-semibold">
              {{ formatDate(selectedDate) }}
            </div>
            <div class="text-base-content/70">
              {{ selectedTime }} - {{ endTime }}
            </div>
          </div>
        </div>

        <!-- Service Selection -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Select Service</span>
          </label>
          <select
            v-model="selectedServiceId"
            class="select select-bordered"
            required
          >
            <option value="">Choose a service...</option>
            <option
              v-for="service in availableServices"
              :key="service.id"
              :value="service.id"
            >
              {{ service.title }} - {{ formatPrice(service) }}
            </option>
          </select>
        </div>

        <!-- Client Information -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Client Email</span>
          </label>
          <input
            v-model="clientEmail"
            type="email"
            class="input input-bordered"
            placeholder="client@example.com"
            required
          >
          <label class="label">
            <span class="label-text-alt text-base-content/60">
              We'll send a booking confirmation to this email
            </span>
          </label>
        </div>

        <!-- Duration -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Duration (minutes)</span>
          </label>
          <input
            v-model.number="duration"
            type="number"
            class="input input-bordered"
            min="15"
            max="480"
            step="15"
            required
          >
        </div>

        <!-- Price -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Price</span>
          </label>
          <div class="input-group">
            <span class="bg-base-200 px-3 py-2">$</span>
            <input
              v-model.number="price"
              type="number"
              class="input input-bordered flex-1"
              min="0"
              step="0.01"
              placeholder="0.00"
            >
          </div>
        </div>

        <!-- Notes -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">Notes (Optional)</span>
          </label>
          <textarea
            v-model="notes"
            class="textarea textarea-bordered"
            rows="3"
            placeholder="Additional notes for this booking..."
          />
        </div>

        <!-- Booking Summary -->
        <div v-if="selectedService" class="bg-base-200 mb-6 rounded-lg p-4">
          <h4 class="mb-3 font-medium">Booking Summary</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Service:</span>
              <span class="font-medium">{{ selectedService.title }}</span>
            </div>
            <div class="flex justify-between">
              <span>Date & Time:</span>
              <span class="font-medium"
                >{{ formatDate(selectedDate) }} at {{ selectedTime }}</span
              >
            </div>
            <div class="flex justify-between">
              <span>Duration:</span>
              <span class="font-medium">{{ formatDuration(duration) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Price:</span>
              <span class="font-medium">${{ price || '0.00' }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-action">
          <button type="button" class="btn btn-outline" @click="$emit('close')">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting || !isFormValid"
          >
            <span
              v-if="submitting"
              class="loading loading-spinner loading-sm"
            />
            Create Booking
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="$emit('close')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format, addMinutes } from 'date-fns'

// Props & Emits
interface Props {
  selectedDate: Date | null
  selectedTime: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  created: [booking: unknown]
}>()

// Composables
const { services, fetchContractorServices } = useServices()
const { error, success } = useNotifications()

// Reactive state
const selectedServiceId = ref('')
const clientEmail = ref('')
const duration = ref(60)
const price = ref(0)
const notes = ref('')
const submitting = ref(false)

// Computed properties
const availableServices = computed(() => {
  return services.value.filter((s) => s.isActive)
})

const selectedService = computed(() => {
  return availableServices.value.find(
    (s) => s.id === Number(selectedServiceId.value)
  )
})

const endTime = computed(() => {
  if (!props.selectedTime || !duration.value) return ''

  const [hours, minutes] = props.selectedTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)

  const endDate = addMinutes(startDate, duration.value)
  return format(endDate, 'HH:mm')
})

const isFormValid = computed(() => {
  return (
    selectedServiceId.value &&
    clientEmail.value &&
    duration.value > 0 &&
    props.selectedDate &&
    props.selectedTime
  )
})

// Methods
const formatDate = (date: Date | null) => {
  if (!date) return ''
  return format(date, 'EEEE, MMMM d, yyyy')
}

const formatPrice = (service: { priceType: string; price?: number }) => {
  if (service.priceType === 'NEGOTIABLE') return 'Negotiable'
  if (service.priceType === 'HOURLY') return `$${service.price}/hour`
  return `$${service.price}`
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

const handleSubmit = async () => {
  if (!isFormValid.value || !props.selectedDate || !props.selectedTime) return

  try {
    submitting.value = true

    // Combine date and time
    const [hours, minutes] = props.selectedTime.split(':').map(Number)
    const scheduledAt = new Date(props.selectedDate)
    scheduledAt.setHours(hours, minutes, 0, 0)

    // Create booking data
    const bookingData = {
      serviceId: Number(selectedServiceId.value),
      clientEmail: clientEmail.value,
      scheduledAt: scheduledAt.toISOString(),
      duration: duration.value,
      totalPrice: price.value,
      notes: notes.value || undefined,
    }

    // Create booking via API
    const response = await $fetch('/api/contractor/calendar/quick-booking', {
      method: 'POST',
      body: bookingData,
    })

    success('Booking Created', 'Quick booking has been successfully created')
    emit('created', response.booking)
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    error(
      'Creation Failed',
      errorData.data?.message || 'Failed to create booking'
    )
  } finally {
    submitting.value = false
  }
}

// Watch for service selection to update price
watch(selectedServiceId, (serviceId) => {
  const service = availableServices.value.find(
    (s) => s.id === Number(serviceId)
  )
  if (service && service.priceType !== 'NEGOTIABLE') {
    price.value = Number(service.price) || 0
  }
  if (service?.duration) {
    duration.value = service.duration
  }
})

// Load services on mount
onMounted(() => {
  fetchContractorServices()
})
</script>
