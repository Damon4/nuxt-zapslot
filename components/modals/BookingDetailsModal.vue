<template>
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Booking Details</h3>
      <p class="py-4">Feature coming soon...</p>
      <div class="modal-action">
        <button class="btn" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  booking: {
    id: number
    service?: { title: string; price: number }
    client?: { name: string; email: string; phone?: string }
    scheduledAt: string
    duration?: number
    status: string
    notes?: string
  }
}

defineProps<Props>()

defineEmits<{
  close: []
  updateStatus: [bookingId: number, status: string]
  reschedule: [booking: unknown]
}>()
</script>
