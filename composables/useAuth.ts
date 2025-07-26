import { authClient } from '~/lib/auth-client'

/**
 * Composable for authentication state and actions
 * Provides a convenient way to access user session and auth methods
 */
export const useAuth = () => {
  const session = authClient.useSession()

  const user = computed(() => session.value?.data?.user || null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = computed(() => session.value?.isPending ?? false)

  const signIn = authClient.signIn
  const signOut = authClient.signOut

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    session: readonly(session),
    signIn,
    signOut,
  }
}
