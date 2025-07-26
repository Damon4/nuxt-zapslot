import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { authClient } from '~/lib/auth-client'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Awaited<ReturnType<typeof authClient.useSession>> | null>(
    null
  )

  async function init() {
    // Initialize auth state with SSR-safe approach
    const data = await authClient.useSession(useFetch)
    session.value = data
  }

  const user = computed(() => session.value?.data?.user || null)
  const loading = computed(() => session.value?.isPending)

  const isAuthenticated = computed(() => !!user.value)

  async function signIn(callbackURL = '/dashboard') {
    await authClient.signIn.social({ provider: 'github', callbackURL })
  }

  async function signOut() {
    await authClient.signOut()
  }

  return {
    init,
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
  }
})
