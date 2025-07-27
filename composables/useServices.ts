import type { Ref } from 'vue'

interface Service {
  id: number
  title: string
  description: string
  category: string
  price?: number
  priceType: 'FIXED' | 'HOURLY' | 'NEGOTIABLE'
  duration?: number
  availability: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  contractor?: {
    id: number
    user: {
      name: string
      image?: string
    }
  }
  bookingsCount?: number
}

interface CreateServiceData {
  title: string
  description: string
  category: string
  price?: number
  priceType: 'FIXED' | 'HOURLY' | 'NEGOTIABLE'
  duration?: number
  availability: string
}

interface SearchParams {
  q?: string
  category?: string
  priceFrom?: number
  priceTo?: number
  availability?: string
  contractorId?: number
  sortBy?: 'price' | 'createdAt' | 'title'
  page?: number
  limit?: number
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

export const useServices = () => {
  const services: Ref<Service[]> = ref([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get contractor's services
  const fetchContractorServices = async () => {
    try {
      isLoading.value = true
      error.value = null

      const data = await $fetch<{ services: Service[] }>(
        '/api/contractor/services'
      )
      services.value = data.services
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to fetch services')
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create new service
  const createService = async (serviceData: CreateServiceData) => {
    try {
      isLoading.value = true
      error.value = null

      const data = await $fetch<{ service: Service }>(
        '/api/contractor/services',
        {
          method: 'POST',
          body: serviceData,
        }
      )

      // Add to services list
      services.value.unshift(data.service)

      return data.service
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to create service')
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update service
  const updateService = async (
    serviceId: number,
    serviceData: CreateServiceData
  ) => {
    try {
      isLoading.value = true
      error.value = null

      const data = await $fetch<{ service: Service }>(
        `/api/contractor/services/${serviceId}`,
        {
          method: 'PUT',
          body: serviceData,
        }
      )

      // Update in services list
      const index = services.value.findIndex((s) => s.id === serviceId)
      if (index !== -1) {
        services.value[index] = data.service
      }

      return data.service
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to update service')
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete service
  const deleteService = async (serviceId: number) => {
    try {
      isLoading.value = true
      error.value = null

      await $fetch(`/api/contractor/services/${serviceId}`, {
        method: 'DELETE',
      })

      // Remove from services list
      services.value = services.value.filter((s) => s.id !== serviceId)
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to delete service')
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Toggle service active status
  const toggleService = async (serviceId: number) => {
    try {
      const data = await $fetch<{ service: Service }>(
        `/api/contractor/services/${serviceId}/toggle`,
        {
          method: 'PATCH',
        }
      )

      // Update in services list
      const index = services.value.findIndex((s) => s.id === serviceId)
      if (index !== -1) {
        services.value[index] = data.service
      }

      return data.service
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to toggle service')
      error.value = errorMessage
      throw err
    }
  }

  // Search services (public)
  const searchServices = async (params: SearchParams = {}) => {
    try {
      isLoading.value = true
      error.value = null

      const query = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value))
        }
      })

      const data = await $fetch<{
        services: Service[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }>(`/api/services/search?${query.toString()}`)

      services.value = data.services
      return data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to search services')
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single service
  const getService = async (serviceId: number) => {
    try {
      const data = await $fetch<{ service: Service }>(
        `/api/services/${serviceId}`
      )
      return data.service
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to get service')
      error.value = errorMessage
      throw err
    }
  }

  return {
    services,
    isLoading,
    error,
    fetchContractorServices,
    createService,
    updateService,
    deleteService,
    toggleService,
    searchServices,
    getService,
  }
}
