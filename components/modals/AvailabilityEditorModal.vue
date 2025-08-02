<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-4xl">
      <h3 class="mb-4 text-lg font-bold">
        <Icon name="tabler:settings" class="mr-2 inline h-5 w-5" />
        Edit Availability
      </h3>

      <div class="space-y-6">
        <!-- Days of week configuration -->
        <div
          v-for="day in daysOfWeek"
          :key="day.value"
          class="card bg-base-200"
        >
          <div v-if="formData[day.value]" class="card-body p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <input
                  :id="`day-${day.value}`"
                  v-model="formData[day.value].isAvailable"
                  type="checkbox"
                  class="checkbox checkbox-primary"
                >
                <label :for="`day-${day.value}`" class="font-medium">
                  {{ day.label }}
                </label>
              </div>
              <div
                v-if="formData[day.value].isAvailable"
                class="text-success text-sm"
              >
                Available
              </div>
              <div v-else class="text-base-content/50 text-sm">Unavailable</div>
            </div>

            <!-- Time inputs when day is available -->
            <div
              v-if="formData[day.value].isAvailable"
              class="grid grid-cols-2 gap-4"
            >
              <div>
                <label class="label">
                  <span class="label-text">Start Time</span>
                </label>
                <input
                  v-model="formData[day.value].startTime"
                  type="time"
                  class="input input-bordered w-full"
                  :class="{
                    'input-error': getTimeError(day.value),
                  }"
                >
              </div>
              <div>
                <label class="label">
                  <span class="label-text">End Time</span>
                </label>
                <input
                  v-model="formData[day.value].endTime"
                  type="time"
                  class="input input-bordered w-full"
                  :class="{
                    'input-error': getTimeError(day.value),
                  }"
                >
              </div>
            </div>

            <!-- Error message -->
            <div v-if="getTimeError(day.value)" class="text-error mt-2 text-sm">
              {{ getTimeError(day.value) }}
            </div>
          </div>
        </div>

        <!-- Quick presets -->
        <div class="card bg-base-100">
          <div class="card-body p-4">
            <h4 class="mb-3 font-medium">Quick Presets</h4>
            <div class="flex flex-wrap gap-2">
              <button
                class="btn btn-outline btn-sm"
                @click="applyPreset('business')"
              >
                Business Hours (9-5, Mon-Fri)
              </button>
              <button
                class="btn btn-outline btn-sm"
                @click="applyPreset('extended')"
              >
                Extended Hours (8-8, Mon-Sat)
              </button>
              <button
                class="btn btn-outline btn-sm"
                @click="applyPreset('weekend')"
              >
                Weekends Only
              </button>
              <button
                class="btn btn-outline btn-sm"
                @click="applyPreset('all')"
              >
                All Week (9-5)
              </button>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="card bg-primary/5 border-primary/20 border">
          <div class="card-body p-4">
            <h4 class="text-primary mb-2 font-medium">Summary</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-base-content/70">Working Days:</span>
                <span class="ml-2 font-medium">{{ workingDaysCount }}</span>
              </div>
              <div>
                <span class="text-base-content/70">Total Weekly Hours:</span>
                <span class="ml-2 font-medium">{{ totalHours }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="$emit('close')">Cancel</button>
        <button
          class="btn btn-primary"
          :disabled="!isValid || loading"
          @click="save"
        >
          <span v-if="loading" class="loading loading-spinner loading-sm" />
          Save Availability
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AvailabilityType {
  id?: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface Props {
  availability?: AvailabilityType[]
  isOpen?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'saved', availability: AvailabilityType[]): void
}

const props = withDefaults(defineProps<Props>(), {
  availability: () => [],
  isOpen: false,
})
const emit = defineEmits<Emits>()

// Use prop reactively
const isOpen = toRef(props, 'isOpen')

// Composables
const { success, error } = useNotifications()

// Reactive state
const loading = ref(false)

// Days of week
const daysOfWeek = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
]

// Form data - initialize with existing availability or defaults
const formData = ref<Record<number, AvailabilityType>>({})

// Initialize form data
const initializeFormData = () => {
  daysOfWeek.forEach((day) => {
    const existing = props.availability?.find((a) => a.dayOfWeek === day.value)

    // Default availability: Monday-Friday (1-5) are available, Weekend is not
    const defaultAvailable = day.value >= 1 && day.value <= 5

    formData.value[day.value] = {
      id: existing?.id,
      dayOfWeek: day.value,
      startTime: existing?.startTime || '09:00',
      endTime: existing?.endTime || '18:00',
      isAvailable: existing?.isAvailable ?? defaultAvailable,
    }
  })
}

// Initialize on mount
onMounted(() => {
  initializeFormData()
})

// Watch for availability changes and update form data
watch(
  () => props.availability,
  () => {
    initializeFormData()
  },
  { deep: true }
)

// Watch for modal opening and reinitialize data
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      initializeFormData()
    }
  }
)

// Computed
const workingDaysCount = computed(() => {
  return Object.values(formData.value).filter((day) => day.isAvailable).length
})

const totalHours = computed(() => {
  return Object.values(formData.value)
    .filter((day) => day.isAvailable)
    .reduce((total, day) => {
      const start = new Date(`2000-01-01T${day.startTime}:00`)
      const end = new Date(`2000-01-01T${day.endTime}:00`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + Math.max(0, hours)
    }, 0)
})

const isValid = computed(() => {
  return Object.values(formData.value).every((day) => {
    if (!day.isAvailable) return true
    return day.startTime < day.endTime
  })
})

// Methods
const getTimeError = (dayOfWeek: number): string => {
  const day = formData.value[dayOfWeek]
  if (!day.isAvailable) return ''
  if (day.startTime >= day.endTime) {
    return 'Start time must be before end time'
  }
  return ''
}

const applyPreset = (preset: string) => {
  switch (preset) {
    case 'business':
      // Monday to Friday, 9 AM to 5 PM
      daysOfWeek.forEach((day) => {
        const isWeekday = day.value >= 1 && day.value <= 5
        formData.value[day.value] = {
          ...formData.value[day.value],
          isAvailable: isWeekday,
          startTime: '09:00',
          endTime: '17:00',
        }
      })
      break

    case 'extended':
      // Monday to Saturday, 8 AM to 8 PM
      daysOfWeek.forEach((day) => {
        const isWorkday = day.value >= 1 && day.value <= 6
        formData.value[day.value] = {
          ...formData.value[day.value],
          isAvailable: isWorkday,
          startTime: '08:00',
          endTime: '20:00',
        }
      })
      break

    case 'weekend':
      // Saturday and Sunday only, 10 AM to 6 PM
      daysOfWeek.forEach((day) => {
        const isWeekend = day.value === 0 || day.value === 6
        formData.value[day.value] = {
          ...formData.value[day.value],
          isAvailable: isWeekend,
          startTime: '10:00',
          endTime: '18:00',
        }
      })
      break

    case 'all':
      // All days, 9 AM to 5 PM
      daysOfWeek.forEach((day) => {
        formData.value[day.value] = {
          ...formData.value[day.value],
          isAvailable: true,
          startTime: '09:00',
          endTime: '17:00',
        }
      })
      break
  }
}

const save = async () => {
  if (!isValid.value) return

  loading.value = true
  try {
    const availabilityArray = Object.values(formData.value)

    const response = await $fetch('/api/contractor/calendar/availability', {
      method: 'POST',
      body: { availability: availabilityArray },
    })

    success('Success', 'Availability settings saved successfully')
    emit('saved', response.availability)
    emit('close')
  } catch (err: unknown) {
    console.error('Error saving availability:', err)
    error('Save Failed', 'Failed to save availability settings')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Custom styles for availability editor */
.modal-box {
  max-height: 90vh;
  overflow-y: auto;
}

/* Ensure proper spacing */
.card + .card {
  margin-top: 0.5rem;
}
</style>
