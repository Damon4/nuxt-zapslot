<template>
  <div class="bg-base-200 min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-base-content mb-2 text-4xl font-bold">
          📅 Calendar Management System
        </h1>
        <p class="text-base-content/70 text-lg">
          Interactive calendar with availability management and time slot
          blocking
        </p>
      </div>

      <!-- Demo Navigation -->
      <div class="mb-8 flex flex-wrap justify-center gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="btn"
          :class="{
            'btn-primary': activeTab === tab.id,
            'btn-outline': activeTab !== tab.id,
          }"
          @click="activeTab = tab.id"
        >
          <Icon :name="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Calendar View Tab -->
      <div v-if="activeTab === 'calendar'" class="space-y-6">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title mb-4">
              <Icon name="tabler:calendar" class="h-5 w-5" />
              Interactive Calendar
            </h2>
            <div class="space-y-4">
              <div class="mockup-window bg-base-300 border">
                <div class="bg-base-200 flex justify-center px-4 py-16">
                  <div class="text-center">
                    <Icon
                      name="tabler:calendar"
                      class="text-primary mx-auto mb-4 h-24 w-24"
                    />
                    <h3 class="mb-2 text-2xl font-bold">
                      Interactive Calendar
                    </h3>
                    <p class="text-base-content/70 mb-4">
                      Full calendar integration with color-coded bookings
                    </p>
                    <div class="flex justify-center gap-2">
                      <div class="badge badge-success">Confirmed</div>
                      <div class="badge badge-warning">Pending</div>
                      <div class="badge badge-error">Cancelled</div>
                      <div class="badge badge-info">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Time Slot Manager Tab -->
      <div v-if="activeTab === 'slots'" class="space-y-6">
        <TimeSlotManager
          :availability="demoAvailability"
          :blocked-slots="demoBlockedSlots"
        />
      </div>

      <!-- Availability Settings Tab -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title mb-4">
              <Icon name="tabler:settings" class="h-5 w-5" />
              Availability Configuration
            </h2>
            <button
              class="btn btn-primary"
              @click="showAvailabilityEditor = true"
            >
              <Icon name="tabler:edit" class="h-4 w-4" />
              Edit Availability
            </button>
          </div>
        </div>
      </div>

      <!-- Features Overview Tab -->
      <div v-if="activeTab === 'features'" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="card bg-base-100 shadow-lg"
          >
            <div class="card-body">
              <h3 class="card-title">
                <Icon :name="feature.icon" class="h-5 w-5" />
                {{ feature.title }}
              </h3>
              <p class="text-base-content/70">{{ feature.description }}</p>
              <div class="card-actions justify-end">
                <div class="badge badge-success">Implemented</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <AvailabilityEditorModal
        v-if="showAvailabilityEditor"
        :availability="demoAvailability"
        @close="showAvailabilityEditor = false"
        @saved="handleAvailabilitySaved"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Types
interface AvailabilityType {
  id: number
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

// Define head meta
useHead({
  title: 'Calendar Demo - ZapSlot',
  meta: [
    {
      name: 'description',
      content: 'Interactive calendar management system demonstration',
    },
  ],
})

// Reactive state
const activeTab = ref('calendar')
const showAvailabilityEditor = ref(false)

// Demo data
const demoAvailability = ref<AvailabilityType[]>([
  {
    id: 1,
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  },
  {
    id: 2,
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  },
  {
    id: 3,
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  },
  {
    id: 4,
    dayOfWeek: 4,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  },
  {
    id: 5,
    dayOfWeek: 5,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  },
  {
    id: 6,
    dayOfWeek: 6,
    startTime: '10:00',
    endTime: '16:00',
    isAvailable: true,
  },
  {
    id: 7,
    dayOfWeek: 0,
    startTime: '10:00',
    endTime: '16:00',
    isAvailable: false,
  },
])

const demoBlockedSlots = ref<BlockedSlotType[]>([
  {
    id: 1,
    date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    reason: 'Personal appointment',
  },
  {
    id: 2,
    date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    reason: 'Equipment maintenance',
  },
])

// Navigation tabs
const tabs = [
  { id: 'calendar', label: 'Calendar View', icon: 'tabler:calendar' },
  { id: 'slots', label: 'Time Management', icon: 'tabler:clock' },
  { id: 'settings', label: 'Availability', icon: 'tabler:settings' },
  { id: 'features', label: 'Features', icon: 'tabler:list' },
]

// Features showcase
const features = [
  {
    title: 'Interactive Calendar',
    description:
      'Visual calendar with color-coded booking statuses and drag-and-drop functionality',
    icon: 'tabler:calendar',
  },
  {
    title: 'Availability Management',
    description:
      'Set working hours for each day of the week with preset configurations',
    icon: 'tabler:clock',
  },
  {
    title: 'Time Slot Blocking',
    description:
      'Block specific time slots for maintenance, breaks, or personal time',
    icon: 'tabler:ban',
  },
  {
    title: 'Booking Status Tracking',
    description:
      'Track bookings through pending, confirmed, cancelled, and completed states',
    icon: 'tabler:check',
  },
  {
    title: 'Conflict Detection',
    description:
      'Automatically prevent double-booking and scheduling conflicts',
    icon: 'tabler:alert-triangle',
  },
  {
    title: 'Responsive Design',
    description: 'Mobile-friendly interface that works on all devices',
    icon: 'tabler:device-mobile',
  },
]

// Demo data
// Methods
const handleAvailabilitySaved = (_availability: AvailabilityType[]) => {
  showAvailabilityEditor.value = false
  // Update demo availability if needed
}
</script>

<style scoped>
/* Custom styles for demo */
.container {
  max-width: 1200px;
}

/* Modal backdrop */
.modal-open {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
