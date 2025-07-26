export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // Initialize auth store on app startup
  if (import.meta.client || import.meta.server) {
    await authStore.init()
  }
})
