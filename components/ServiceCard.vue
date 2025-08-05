<template>
  <div
    class="card bg-base-200 shadow-lg transition-shadow duration-300 hover:shadow-xl"
  >
    <div class="card-body p-6">
      <!-- Service Header -->
      <div class="mb-4 flex items-start justify-between">
        <div class="flex-1">
          <h3 class="card-title mb-2 line-clamp-2 text-lg font-bold">
            {{ service.title }}
          </h3>
          <div class="badge badge-primary badge-sm">
            {{ service.category }}
          </div>
        </div>
        <div class="avatar placeholder ml-4">
          <div class="bg-primary text-primary-content w-12 rounded-full">
            <img
              v-if="service.contractor.user.image"
              :src="service.contractor.user.image"
              :alt="service.contractor.user.name"
              class="rounded-full"
            >
            <span v-else class="text-sm">
              {{ getInitials(service.contractor.user.name) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Service Description -->
      <p class="text-base-content/70 mb-4 line-clamp-3 text-sm">
        {{ service.description }}
      </p>

      <!-- Service Details -->
      <div class="mb-4 grid grid-cols-2 gap-3">
        <!-- Price -->
        <div class="flex items-center gap-2">
          <Icon name="tabler:currency-dollar" class="text-success h-4 w-4" />
          <span class="text-sm">
            <span v-if="service.price" class="font-semibold"
              >${{ service.price }}</span
            >
            <span v-else class="text-base-content/70">Negotiable</span>
          </span>
        </div>

        <!-- Duration -->
        <div class="flex items-center gap-2">
          <Icon name="tabler:clock" class="text-info h-4 w-4" />
          <span class="text-sm">
            <span v-if="service.duration">{{
              formatDuration(service.duration)
            }}</span>
            <span v-else class="text-base-content/70">Flexible</span>
          </span>
        </div>

        <!-- Availability -->
        <div class="flex items-center gap-2">
          <Icon name="tabler:calendar" class="text-warning h-4 w-4" />
          <span class="text-sm">{{
            formatAvailability(service.availability)
          }}</span>
        </div>

        <!-- Bookings Count -->
        <div class="flex items-center gap-2">
          <Icon name="tabler:users" class="text-secondary h-4 w-4" />
          <span class="text-sm">{{ service.bookingsCount }} bookings</span>
        </div>
      </div>

      <!-- Contractor Info -->
      <div
        class="border-base-300 flex items-center justify-between border-t pt-4"
      >
        <div class="flex items-center gap-2">
          <span class="text-base-content/70 text-sm">by</span>
          <span class="text-sm font-medium">{{
            service.contractor.user.name
          }}</span>
        </div>
        <div class="card-actions">
          <NuxtLink
            :to="`/services/${service.id}`"
            class="btn btn-primary btn-sm"
          >
            View Details
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ServiceProps {
  service: {
    id: number
    title: string
    description: string
    category: string
    price: string | null
    priceType: string
    duration: number | null
    availability: string
    contractor: {
      user: {
        name: string
        image: string | null
      }
    }
    bookingsCount: number
  }
}

defineProps<ServiceProps>()

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDuration = (minutes: number): string => {
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

const formatAvailability = (availability: string): string => {
  const availabilityMap: Record<string, string> = {
    WEEKDAYS: 'Weekdays',
    WEEKENDS: 'Weekends',
    MORNINGS: 'Mornings',
    EVENINGS: 'Evenings',
    FLEXIBLE: 'Flexible',
  }
  return availabilityMap[availability] || availability
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
