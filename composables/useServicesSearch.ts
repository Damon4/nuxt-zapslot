import { ref, computed, readonly } from 'vue'

export interface ServiceSearchParams {
  q?: string
  category?: string
  priceFrom?: number
  priceTo?: number
  availability?: string
  contractorId?: number
  minRating?: number
  sortBy?: 'price' | 'createdAt' | 'title' | 'rating'
  page?: number
  limit?: number
}

export interface Service {
  id: number
  title: string
  description: string
  category: string
  price: string | null
  priceType: string
  duration: number | null
  availability: string
  contractor: {
    user: {
      name: string
      image: string | null
    }
  }
  bookingsCount: number
  averageRating: number
  reviewCount: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ServiceSearchResponse {
  services: Service[]
  pagination: Pagination
}

export const useServicesSearch = () => {
  // Search parameters
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const maxPrice = ref('')
  const minRating = ref('')
  const sortBy = ref<'price' | 'createdAt' | 'title' | 'rating'>('createdAt')
  const currentPage = ref(1)

  // Build search params for useFetch
  const searchParams = computed(() => {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '12',
      sortBy: sortBy.value,
    })

    if (searchQuery.value) {
      params.append('q', searchQuery.value)
    }

    if (selectedCategory.value) {
      params.append('category', selectedCategory.value)
    }

    if (maxPrice.value) {
      const priceTo = parseFloat(maxPrice.value)
      if (!isNaN(priceTo)) {
        params.append('priceTo', priceTo.toString())
      }
    }

    if (minRating.value) {
      const rating = parseFloat(minRating.value)
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        params.append('minRating', rating.toString())
      }
    }

    return params.toString()
  })

  // Use useFetch with reactive search params
  const {
    data,
    pending: loading,
    error,
    refresh,
  } = useFetch<ServiceSearchResponse>(
    () => `/api/services/search?${searchParams.value}`,
    {
      key: () => `services-search-${searchParams.value}`,
      default: () => ({
        services: [],
        pagination: { page: 1, limit: 12, total: 0, pages: 0 },
      }),
      watch: [searchParams],
    }
  )

  const services = computed(() => data.value?.services || [])
  const pagination = computed(() => data.value?.pagination || null)

  let searchTimeout: NodeJS.Timeout

  const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 1 // Reset to first page on new search
    }, 500)
  }

  const handleFilterChange = () => {
    currentPage.value = 1 // Reset to first page on filter change
  }

  const changePage = (page: number) => {
    currentPage.value = page
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = ''
    maxPrice.value = ''
    minRating.value = ''
    sortBy.value = 'createdAt'
    currentPage.value = 1
  }

  // Computed pagination pages for UI
  const paginationPages = computed(() => {
    if (!pagination.value) return []
    const pages = []
    const total = pagination.value.pages
    const current = pagination.value.page

    // Simple pagination: show up to 5 pages around current
    const start = Math.max(1, current - 2)
    const end = Math.min(total, start + 4)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })

  const hasResults = computed(() => services.value.length > 0)
  const hasMultiplePages = computed(
    () => pagination.value && pagination.value.pages > 1
  )

  return {
    // State
    services,
    loading,
    error,
    pagination,

    // Search parameters
    searchQuery,
    selectedCategory,
    maxPrice,
    minRating,
    sortBy,
    currentPage: readonly(currentPage),

    // Computed
    paginationPages,
    hasResults,
    hasMultiplePages,

    // Methods
    debouncedSearch,
    handleFilterChange,
    changePage,
    clearFilters,
    refresh,
  }
}
