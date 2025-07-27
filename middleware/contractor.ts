export default defineNuxtRouteMiddleware(async () => {
  try {
    // For client-side, first check auth state from store
    if (import.meta.client) {
      const authStore = useAuthStore()

      // If not authenticated, redirect immediately
      if (!authStore.isAuthenticated) {
        return navigateTo('/profile')
      }
    }

    // Check if user has contractor profile
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
  } catch (error: unknown) {
    // For client-side, redirect to profile page
    if (import.meta.client) {
      await navigateTo('/profile')
      return
    }

    // For server-side, throw the error
    throw error
  }
})
