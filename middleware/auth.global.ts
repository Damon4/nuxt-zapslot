export default defineNuxtRouteMiddleware(async (to) => {
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/contractor', '/admin']

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    to.path.startsWith(route)
  )

  if (!isProtectedRoute) {
    return
  }

  try {
    // Check authentication on both server and client
    if (import.meta.server) {
      // Server-side authentication check
      const headers = useRequestHeaders(['cookie'])
      const session = await $fetch('/api/auth/get-session', {
        headers,
        server: true,
      })

      // If no session or user, redirect to home
      if (!session?.user) {
        // ...log removed...
        return navigateTo('/')
      }
    } else {
      // Client-side authentication check
      try {
        const session = await $fetch('/api/auth/get-session')

        // If no session or user, redirect to home
        if (!session?.user) {
          // ...log removed...
          return navigateTo('/')
        }
      } catch (error) {
        console.error('Client auth check failed:', error)
        return navigateTo('/')
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/')
  }
})
