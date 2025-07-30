<template>
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-xl">
      <form @submit.prevent="handleSubmit">
        <!-- Modal Header -->
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-lg font-bold">Reschedule Booking</h3>
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost"
            @click="$emit('close')"
          >
            <Icon name="tabler:x" class="h-4 w-4" />
          </button>
        </div>

        <!-- Current Booking Info -->
        <div v-if="booking" class="bg-base-200 mb-6 rounded-lg p-4">
          <h4 class="mb-3 font-medium">Current Booking</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Service:</span>
              <span class="font-medium">{{ booking.service?.title }}</span>
            </div>
            <div class="flex justify-between">
              <span>Client:</span>
              <span class="font-medium">{{ booking.client?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>Current Time:</span>
              <span class="font-medium">{{
                formatDateTime(booking.scheduledAt)
              }}</span>
            </div>
          </div>
        </div>

        <!-- New Date/Time -->
        <div class="bg-primary/10 mb-6 rounded-lg p-4">
          <div class="text-primary flex items-center gap-2">
            <Icon name="tabler:calendar-event" class="h-5 w-5" />
            <span class="font-medium">New Time Slot</span>
          </div>
          <div class="mt-2">
            <div class="text-lg font-semibold">
              {{ formatDate(newDate) }}
            </div>
            <div class="text-base-content/70">
              {{ newTime }} - {{ endTime }}
            </div>
          </div>
        </div>

        <!-- Reschedule Reason -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">Reason for Reschedule</span>
          </label>
          <select v-model="reason" class="select select-bordered" required>
            <option value="">Select a reason...</option>
            <option value="contractor_request">Contractor Request</option>
            <option value="client_request">Client Request</option>
            <option value="schedule_conflict">Schedule Conflict</option>
            <option value="emergency">Emergency</option>
            <option value="weather">Weather</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Additional Notes -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium"
              >Additional Notes (Optional)</span
            >
          </label>
          <textarea
            v-model="notes"
            class="textarea textarea-bordered"
            rows="3"
            placeholder="Explain the reason for rescheduling..."
          />
        </div>

        <!-- Notification Options -->
        <div class="form-control mb-6">
          <label class="label cursor-pointer">
            <span class="label-text">Notify client about the change</span>
            <input
              v-model="notifyClient"
              type="checkbox"
              class="checkbox checkbox-primary"
              checked
            >
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">Send reschedule confirmation</span>
            <input
              v-model="sendConfirmation"
              type="checkbox"
              class="checkbox checkbox-primary"
              checked
            >
          </label>
        </div>

        <!-- Warning -->
        <div class="alert alert-warning mb-6">
          <Icon name="tabler:alert-triangle" class="h-5 w-5" />
          <div>
            <strong>Important:</strong> Rescheduling will notify the client and
            update their booking. Make sure the new time slot is available.
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-action">
          <button type="button" class="btn btn-outline" @click="$emit('close')">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-warning"
            :disabled="submitting || !isFormValid"
          >
            <span
              v-if="submitting"
              class="loading loading-spinner loading-sm"
            />
            Reschedule Booking
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="$emit('close')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, addMinutes } from 'date-fns'

// Props & Emits
interface Props {
  booking: {
    id: number
    service?: { title: string }
    client?: { name: string }
    scheduledAt: string
    duration?: number
  } | null
  newDate: Date | null
  newTime: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  rescheduled: [booking: unknown]
}>()

// Composables
const { error, success } = useNotifications()

// Reactive state
const reason = ref('')
const notes = ref('')
const notifyClient = ref(true)
const sendConfirmation = ref(true)
const submitting = ref(false)

// Computed properties
const endTime = computed(() => {
  if (!props.newTime || !props.booking?.duration) return ''

  const [hours, minutes] = props.newTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)

  const endDate = addMinutes(startDate, props.booking.duration)
  return format(endDate, 'HH:mm')
})

const isFormValid = computed(() => {
  return reason.value && props.newDate && props.newTime && props.booking
})

// Methods
const formatDate = (date: Date | null) => {
  if (!date) return ''
  return format(date, 'EEEE, MMMM d, yyyy')
}

const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString)
  return format(date, "EEEE, MMMM d, yyyy 'at' HH:mm")
}

const handleSubmit = async () => {
  if (!isFormValid.value || !props.booking || !props.newDate || !props.newTime)
    return

  try {
    submitting.value = true

    // Combine new date and time
    const [hours, minutes] = props.newTime.split(':').map(Number)
    const newScheduledAt = new Date(props.newDate)
    newScheduledAt.setHours(hours, minutes, 0, 0)

    // Reschedule data
    const rescheduleData = {
      newScheduledAt: newScheduledAt.toISOString(),
      reason: reason.value,
      notes: notes.value || undefined,
      notifyClient: notifyClient.value,
      sendConfirmation: sendConfirmation.value,
    }

    // Reschedule booking via API
    const response = await $fetch<unknown>(
      `/api/contractor/bookings/${props.booking.id}/reschedule`,
      {
        method: 'PATCH' as const,
        body: rescheduleData,
      }
    )

    success(
      'Booking Rescheduled',
      'The booking has been successfully rescheduled'
    )
    emit('rescheduled', response)
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    error(
      'Reschedule Failed',
      errorData.data?.message || 'Failed to reschedule booking'
    )
  } finally {
    submitting.value = false
  }
}
</script>
