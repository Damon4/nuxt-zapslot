<script setup lang="ts">
import { useNotifications } from '~/composables/useNotifications'

const { notifications, removeNotification } = useNotifications()

const getAlertClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'alert-success'
    case 'error':
      return 'alert-error'
    case 'warning':
      return 'alert-warning'
    case 'info':
      return 'alert-info'
    default:
      return 'alert-info'
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'tabler:check'
    case 'error':
      return 'tabler:x'
    case 'warning':
      return 'tabler:alert-triangle'
    case 'info':
      return 'tabler:info-circle'
    default:
      return 'tabler:info-circle'
  }
}
</script>

<template>
  <div class="toast toast-top toast-end z-50">
    <TransitionGroup name="notification" tag="div" class="space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="alert max-w-sm shadow-lg"
        :class="getAlertClass(notification.type)"
      >
        <Icon :name="getIcon(notification.type)" size="20" />
        <div class="flex-1">
          <h3 class="font-medium">{{ notification.title }}</h3>
          <p v-if="notification.message" class="text-sm opacity-90">
            {{ notification.message }}
          </p>
        </div>
        <button
          class="btn btn-ghost btn-xs"
          @click="removeNotification(notification.id)"
        >
          <Icon name="tabler:x" size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
