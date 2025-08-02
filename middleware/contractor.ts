export default defineNuxtRouteMiddleware(async () => {
  // Skip middleware on server side to avoid SSR issues
  if (import.meta.server) {
    return
  }

  try {
    const authStore = useAuthStore()

    // If not authenticated, redirect immediately
    if (!authStore.isAuthenticated) {
      return navigateTo('/profile')
    }

    // Check if user has contractor profile (only on client-side)
    const response = await $fetch('/api/contractor/profile')

    if (!response.success || !response.data) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Contractor profile required',
      })
    }

    // Check if contractor is approved
    if (response.data.status !== 1) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Contractor approval required',
      })
    }
  } catch {
    // Redirect to profile page on any error
    await navigateTo('/profile')
    return
  }
})
