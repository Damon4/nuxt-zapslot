interface AuthUser {
  id: string
  name: string
  email: string
  image?: string
}

interface AuthSession {
  user: AuthUser | null
  session: Record<string, unknown> | null
}

/**
 * Server-safe authentication composable
 * Works with SSR and avoids hydration mismatches
 */
export const useServerAuth = () => {
  const sessionData = ref<AuthSession | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Fetch session data
  const fetchSession = async () => {
    try {
      isLoading.value = true
      error.value = null

      const data = await $fetch<AuthSession>('/api/auth/get-session')
      sessionData.value = data
    } catch (err) {
      console.error('Failed to fetch session:', err)
      error.value = 'Failed to load session'
      sessionData.value = { user: null, session: null }
    } finally {
      isLoading.value = false
    }
  }

  // Initialize session on mount (client-side only)
  onMounted(async () => {
    await fetchSession()
  })

  // Computed values for easier access
  const user = computed(() => sessionData.value?.user || null)
  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    session: sessionData,
    isAuthenticated,
    isLoading,
    error,
    refreshSession: fetchSession,
  }
}
