<template>
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Availability Settings</h3>
      <p class="py-4">Feature coming soon...</p>
      <div class="modal-action">
        <button class="btn" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  availability: Array<{
    date: string
    timeSlots: Array<{
      startTime: string
      endTime: string
      isAvailable: boolean
    }>
  }>
}

defineProps<Props>()

defineEmits<{
  close: []
  saved: [availability: unknown[]]
}>()
</script>
