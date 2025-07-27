import type { Ref } from 'vue'

interface Booking {
  id: number
  serviceId: number
  clientId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  scheduledAt: string
  duration?: number
  totalPrice?: number
  notes?: string
  createdAt: string
  updatedAt: string
  service?: {
    title: string
    category: string
    price?: number
    priceType: string
    contractor?: {
      user: {
        name: string
        image?: string
      }
    }
  }
  client?: {
    name: string
    email: string
    image?: string
  }
}

interface CreateBookingData {
  scheduledAt: string
  notes?: string
}

// Utility function to extract error message
const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (err && typeof err === 'object' && 'data' in err) {
    const errorData = err.data as Record<string, unknown>
    if (errorData && typeof errorData.message === 'string') {
      return errorData.message
    }
  }
  return defaultMessage
}

export const useBookings = () => {
  const bookings: Ref<Booking[]> = ref([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get user's bookings (as client)
  const fetchUserBookings = async () => {
    try {
      isLoading.value = true
      error.value = null

      const data = await $fetch<{ bookings: Booking[] }>('/api/user/bookings')
      bookings.value = data.bookings
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to fetch bookings')
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get contractor's bookings (incoming orders)
  const fetchContractorBookings = async (status?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const query = status ? `?status=${status}` : ''
      const data = await $fetch<{ bookings: Booking[] }>(
        `/api/contractor/bookings${query}`
      )
      bookings.value = data.bookings
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(
        err,
        'Failed to fetch contractor bookings'
      )
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create booking for a service
  const createBooking = async (
    serviceId: number,
    bookingData: CreateBookingData
  ) => {
    try {
      isLoading.value = true
      error.value = null

      const data = await $fetch<{ booking: Booking }>(
        `/api/services/${serviceId}/book`,
        {
          method: 'POST',
          body: bookingData,
        }
      )

      // Add to bookings list if we're showing user bookings
      if (bookings.value.length > 0 && bookings.value[0]?.clientId) {
        bookings.value.unshift(data.booking)
      }

      return data.booking
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to create booking')
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Cancel booking (as client)
  const cancelBooking = async (bookingId: number) => {
    try {
      isLoading.value = true
      error.value = null

      const data = await $fetch<{ booking: Booking }>(
        `/api/user/bookings/${bookingId}/cancel`,
        {
          method: 'PATCH',
        }
      )

      // Update in bookings list
      const index = bookings.value.findIndex((b) => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = data.booking
      }

      return data.booking
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to cancel booking')
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update booking status (as contractor)
  const updateBookingStatus = async (
    bookingId: number,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  ) => {
    try {
      isLoading.value = true
      error.value = null

      const data = await $fetch<{ booking: Booking }>(
        `/api/contractor/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          body: { status },
        }
      )

      // Update in bookings list
      const index = bookings.value.findIndex((b) => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = data.booking
      }

      return data.booking
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(
        err,
        'Failed to update booking status'
      )
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Helper functions
  const getBookingsByStatus = (status: string) => {
    return computed(() => bookings.value.filter((b) => b.status === status))
  }

  const getPendingBookings = () => getBookingsByStatus('PENDING')
  const getConfirmedBookings = () => getBookingsByStatus('CONFIRMED')
  const getCancelledBookings = () => getBookingsByStatus('CANCELLED')
  const getCompletedBookings = () => getBookingsByStatus('COMPLETED')

  const getUpcomingBookings = () => {
    return computed(() => {
      const now = new Date()
      return bookings.value
        .filter(
          (b) =>
            (b.status === 'PENDING' || b.status === 'CONFIRMED') &&
            new Date(b.scheduledAt) > now
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        )
    })
  }

  return {
    bookings,
    isLoading,
    error,
    fetchUserBookings,
    fetchContractorBookings,
    createBooking,
    cancelBooking,
    updateBookingStatus,
    getBookingsByStatus,
    getPendingBookings,
    getConfirmedBookings,
    getCancelledBookings,
    getCompletedBookings,
    getUpcomingBookings,
  }
}
