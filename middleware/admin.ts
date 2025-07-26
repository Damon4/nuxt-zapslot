export default defineNuxtRouteMiddleware((_to, _from) => {
  // Skip middleware on server side to avoid SSR issues
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  // Check if user is admin
  if (!authStore.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }
})
