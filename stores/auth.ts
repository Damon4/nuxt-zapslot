import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

interface SessionData {
  id: string
  token: string
  userId: string
  expiresAt?: string
  createdAt?: string
  updatedAt?: string
  ipAddress?: string | null
  userAgent?: string | null
}

interface AuthState {
  user: User | null
  session: SessionData | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user,
    userName: (state): string | null => state.user?.name || null,
    userEmail: (state): string | null => state.user?.email || null,
    userImage: (state): string | null => state.user?.image || null,
  },

  actions: {
    async fetchSession() {
      this.isLoading = true
      this.error = null

      try {
        const data = await $fetch<{
          user: User | null
          session: SessionData | null
        }>('/api/auth/get-session')
        this.user = data.user
        this.session = data.session
      } catch (error) {
        console.error('Failed to fetch auth session:', error)
        this.error = 'Failed to load authentication state'
        this.user = null
        this.session = null
      } finally {
        this.isLoading = false
      }
    },

    clear() {
      this.user = null
      this.session = null
      this.error = null
      this.isLoading = false
    },

    updateAuthData(data: { user: User | null; session: SessionData | null }) {
      this.user = data.user
      this.session = data.session
    },

    async signOut() {
      try {
        // Clear local state immediately for better UX
        this.clear()

        // Perform actual sign out (this might redirect)
        const { authClient } = await import('~/lib/auth-client')
        await authClient.signOut()
      } catch (error) {
        console.error('Sign out failed:', error)
        this.error = 'Sign out failed'
      }
    },
  },
})
