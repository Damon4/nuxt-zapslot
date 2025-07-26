export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side for non-protected routes
  if (import.meta.server) {
    // Define protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/profile']

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      to.path.startsWith(route)
    )

    if (!isProtectedRoute) {
      return
    }

    try {
      // Get session on server-side using the auth API
      const headers = useRequestHeaders(['cookie'])
      const session = await $fetch('/api/auth/get-session', {
        headers,
        server: true,
      })

      // If no session or user, redirect to home
      if (!session?.user) {
        return navigateTo('/')
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      return navigateTo('/')
    }
  }
})
