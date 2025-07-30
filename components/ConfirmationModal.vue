<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'danger',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()

const getButtonClass = () => {
  switch (props.type) {
    case 'danger':
      return 'btn-error'
    case 'warning':
      return 'btn-warning'
    case 'info':
      return 'btn-info'
    default:
      return 'btn-error'
  }
}

const getIcon = () => {
  switch (props.type) {
    case 'danger':
      return 'tabler:alert-triangle'
    case 'warning':
      return 'tabler:exclamation-circle'
    case 'info':
      return 'tabler:info-circle'
    default:
      return 'tabler:alert-triangle'
  }
}
</script>

<template>
  <div v-if="show" class="modal modal-open">
    <div class="modal-box">
      <div class="mb-4 flex items-center gap-3">
        <div
          :class="[
            'flex h-12 w-12 items-center justify-center rounded-full',
            type === 'danger' ? 'bg-error/10 text-error' : '',
            type === 'warning' ? 'bg-warning/10 text-warning' : '',
            type === 'info' ? 'bg-info/10 text-info' : '',
          ]"
        >
          <Icon :name="getIcon()" class="h-6 w-6" />
        </div>
        <div>
          <h3 class="text-lg font-bold">{{ title }}</h3>
          <p class="text-base-content/70">{{ message }}</p>
        </div>
      </div>

      <!-- Additional content slot -->
      <div v-if="$slots.default" class="mb-6">
        <slot />
      </div>

      <div class="modal-action">
        <button class="btn" :disabled="loading" @click="emit('cancel')">
          {{ cancelText }}
        </button>
        <button
          :class="['btn', getButtonClass()]"
          :disabled="loading"
          @click="emit('confirm')"
        >
          <span
            v-if="loading"
            class="loading loading-spinner loading-sm mr-2"
          />
          {{ loading ? 'Processing...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
