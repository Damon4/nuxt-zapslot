<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-bold">
        <Icon name="tabler:ban" class="mr-2 inline h-5 w-5" />
        Block Time Slot
      </h3>

      <form class="space-y-4" @submit.prevent="blockTime">
        <!-- Date Selection -->
        <div>
          <label class="label">
            <span class="label-text">Date</span>
          </label>
          <input
            v-model="formData.date"
            type="date"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.date }"
            :min="minDate"
            required
          >
          <div v-if="errors.date" class="label">
            <span class="label-text-alt text-error">{{ errors.date }}</span>
          </div>
        </div>

        <!-- Time Range -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">
              <span class="label-text">Start Time</span>
            </label>
            <input
              v-model="formData.startTime"
              type="time"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.startTime }"
              required
            >
            <div v-if="errors.startTime" class="label">
              <span class="label-text-alt text-error">{{
                errors.startTime
              }}</span>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text">End Time</span>
            </label>
            <input
              v-model="formData.endTime"
              type="time"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.endTime }"
              required
            >
            <div v-if="errors.endTime" class="label">
              <span class="label-text-alt text-error">{{
                errors.endTime
              }}</span>
            </div>
          </div>
        </div>

        <!-- Reason (Optional) -->
        <div>
          <label class="label">
            <span class="label-text">Reason (Optional)</span>
          </label>
          <textarea
            v-model="formData.reason"
            class="textarea textarea-bordered w-full"
            placeholder="Enter reason for blocking this time slot..."
            rows="3"
            maxlength="200"
          />
          <div class="label">
            <span class="label-text-alt">
              {{ formData.reason?.length || 0 }}/200 characters
            </span>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="isValidTimeRange" class="alert alert-info">
          <Icon name="tabler:info-circle" class="h-4 w-4" />
          <div>
            <div class="font-medium">Time slot will be blocked:</div>
            <div class="text-sm">
              {{ formatPreview() }}
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="generalError" class="alert alert-error">
          <Icon name="tabler:alert-circle" class="h-4 w-4" />
          <span>{{ generalError }}</span>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="$emit('close')">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-warning"
            :disabled="!isValid || loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            <Icon v-else name="tabler:ban" class="h-4 w-4" />
            Block Time
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  isOpen?: boolean
  selectedDate?: string
  selectedTime?: string
}

interface BlockedSlotType {
  id: number
  date: string
  startTime: string
  endTime: string
  reason?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'blocked', slot: BlockedSlotType): void
}

const emit = defineEmits<Emits>()

// Props
const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  selectedDate: '',
  selectedTime: '',
})

// Use prop reactively
const isOpen = toRef(props, 'isOpen')

// Composables
const { success } = useNotifications()

// Reactive state
const loading = ref(false)
const generalError = ref('')

// Form data
const formData = ref({
  date: '',
  startTime: '',
  endTime: '',
  reason: '',
})

// Form errors
const errors = ref({
  date: '',
  startTime: '',
  endTime: '',
})

// Computed
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isValidTimeRange = computed(() => {
  if (!formData.value.startTime || !formData.value.endTime) return false
  return formData.value.startTime < formData.value.endTime
})

const isValid = computed(() => {
  return (
    formData.value.date &&
    formData.value.startTime &&
    formData.value.endTime &&
    isValidTimeRange.value &&
    !Object.values(errors.value).some((error) => error)
  )
})

// Methods
const validateForm = () => {
  errors.value = {
    date: '',
    startTime: '',
    endTime: '',
  }
  generalError.value = ''

  // Validate date
  if (!formData.value.date) {
    errors.value.date = 'Date is required'
  } else {
    const selectedDate = new Date(formData.value.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      errors.value.date = 'Cannot block time in the past'
    }
  }

  // Validate time range
  if (!formData.value.startTime) {
    errors.value.startTime = 'Start time is required'
  }

  if (!formData.value.endTime) {
    errors.value.endTime = 'End time is required'
  }

  if (formData.value.startTime && formData.value.endTime) {
    if (formData.value.startTime >= formData.value.endTime) {
      errors.value.endTime = 'End time must be after start time'
    }
  }

  return !Object.values(errors.value).some((error) => error)
}

const formatPreview = (): string => {
  if (!formData.value.date || !isValidTimeRange.value) return ''

  const date = new Date(formData.value.date)
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `${dateStr} from ${formData.value.startTime} to ${formData.value.endTime}`
}

const blockTime = async () => {
  if (!validateForm()) return

  loading.value = true
  generalError.value = ''

  try {
    const response = await $fetch('/api/contractor/calendar/block-time', {
      method: 'POST',
      body: {
        date: formData.value.date,
        startTime: formData.value.startTime,
        endTime: formData.value.endTime,
        reason: formData.value.reason || undefined,
      },
    })

    success('Time Blocked', 'Time slot has been blocked successfully')

    // Convert null to undefined for TypeScript compatibility
    const blockedSlot: BlockedSlotType = {
      id: response.timeSlot.id,
      date: response.timeSlot.date,
      startTime: response.timeSlot.startTime,
      endTime: response.timeSlot.endTime,
      reason: response.timeSlot.reason || undefined,
    }

    emit('blocked', blockedSlot)
    emit('close')
  } catch (err: unknown) {
    console.error('Error blocking time:', err)

    // Handle FetchError from ofetch
    if (err && typeof err === 'object' && 'data' in err) {
      const fetchError = err as {
        status?: number
        statusCode?: number
        statusText?: string
        message?: string
        data?: {
          message?: string
          conflicts?: Array<{
            startTime: string
            endTime: string
            reason?: string
          }>
        }
      }

      // Check if it's a 409 status code
      if (fetchError.status === 409 || fetchError.statusCode === 409) {
        const errorData = fetchError.data

        if (errorData?.conflicts && errorData.conflicts.length > 0) {
          const conflictTimes = errorData.conflicts
            .map(
              (conflict) =>
                `${conflict.startTime}-${conflict.endTime}${conflict.reason ? ' (' + conflict.reason + ')' : ''}`
            )
            .join(', ')
          generalError.value = `This time conflicts with existing blocked slots: ${conflictTimes}`
        } else {
          // Extract meaningful message from statusText or message
          const statusText = fetchError.statusText || fetchError.message || ''
          if (statusText.includes('conflicts with existing blocked time')) {
            generalError.value = statusText
          } else {
            generalError.value =
              'This time slot conflicts with existing bookings or blocked time'
          }
        }
      } else if (fetchError.data?.message) {
        generalError.value = fetchError.data.message
      } else if (fetchError.statusText) {
        generalError.value = fetchError.statusText
      } else if (fetchError.message) {
        generalError.value = fetchError.message
      } else {
        generalError.value = 'Unable to block this time slot. Please try again.'
      }
    } else {
      generalError.value =
        'Network error. Please check your connection and try again.'
    }
  } finally {
    loading.value = false
  }
}

// Initialize with today's date and reasonable default times
onMounted(() => {
  const today = new Date()
  formData.value.date = today.toISOString().split('T')[0]

  // Default to next hour
  const nextHour = new Date()
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  formData.value.startTime = nextHour.toTimeString().slice(0, 5)

  // Default end time 1 hour later
  const endHour = new Date(nextHour)
  endHour.setHours(endHour.getHours() + 1)
  formData.value.endTime = endHour.toTimeString().slice(0, 5)
})

// Watch for form changes to validate
watch(formData, validateForm, { deep: true })
</script>

<style scoped>
/* Custom styles for block time modal */
.textarea {
  resize: vertical;
  min-height: 4rem;
}

/* Loading state */
.btn:disabled {
  opacity: 0.5;
}
</style>
