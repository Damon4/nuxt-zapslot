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

    // Check contractor status after session initialization
    if (user.value) {
      await checkContractorStatus()
    }
  }

  const user = computed(() => session.value?.data?.user || null)
  const loading = computed(() => session.value?.isPending)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => {
    const currentUser = user.value as typeof user.value & { isAdmin?: boolean }
    return !!currentUser?.isAdmin
  })

  // Contractor status
  const contractorStatus = ref<boolean | null>(null)

  // Check if user is an approved contractor
  const isContractor = computed(() => {
    return contractorStatus.value === true
  })

  // Check contractor status from API
  const checkContractorStatus = async () => {
    if (!user.value) {
      contractorStatus.value = false
      return false
    }

    try {
      const response = await $fetch('/api/contractor/profile')
      const isApproved = response.success && response.data?.status === 1
      contractorStatus.value = isApproved
      return isApproved
    } catch {
      contractorStatus.value = false
      return false
    }
  }

  async function signIn(callbackURL = '/dashboard') {
    await authClient.signIn.social({ provider: 'github', callbackURL })
  }

  async function signOut() {
    await authClient.signOut()
  }

  // Refresh session data
  async function refreshSession() {
    await init()
  }

  return {
    init,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isContractor,
    checkContractorStatus,
    signIn,
    signOut,
    refreshSession,
  }
})
