<template>
  <div class="bg-base-100 min-h-screen">
    <!-- Page Header -->
    <div
      class="from-primary to-secondary text-primary-content bg-gradient-to-r py-16"
    >
      <div class="container mx-auto px-4">
        <div class="text-center">
          <h1 class="mb-4 text-4xl font-bold">Find the Perfect Service</h1>
          <p class="text-xl opacity-90">
            Discover professional services from verified contractors
          </p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="container mx-auto px-4 py-8">
      <div class="card bg-base-200 mb-8 shadow-lg">
        <div class="card-body">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <!-- Search Input -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Search services</span>
              </label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Web development, cleaning..."
                class="input input-bordered"
                @input="handleSearch"
              >
            </div>

            <!-- Category Filter -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Category</span>
              </label>
              <select
                v-model="selectedCategory"
                class="select select-bordered"
                @change="handleFilterChange"
              >
                <option value="">All Categories</option>
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <!-- Price Range -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Max Price</span>
              </label>
              <input
                v-model="maxPrice"
                type="number"
                placeholder="100"
                class="input input-bordered"
                @input="handleFilterChange"
              >
            </div>

            <!-- Sort By -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Sort by</span>
              </label>
              <select
                v-model="sortBy"
                class="select select-bordered"
                @change="handleFilterChange"
              >
                <option value="createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-8 text-center">
        <span class="loading loading-spinner loading-lg" />
        <p class="mt-4">Searching services...</p>
      </div>

      <!-- Services Grid -->
      <div
        v-else-if="services.length > 0"
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <ServiceCard
          v-for="service in services"
          :key="service.id"
          :service="service"
        />
      </div>

      <!-- No Results -->
      <div v-else class="py-16 text-center">
        <div class="mx-auto max-w-md">
          <Icon
            name="tabler:search-off"
            class="text-base-300 mx-auto mb-4 h-24 w-24"
          />
          <h3 class="mb-2 text-2xl font-bold">No services found</h3>
          <p class="text-base-content/70 mb-6">
            Try adjusting your search criteria or browse all available services.
          </p>
          <button class="btn btn-primary" @click="clearFilters">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.pages > 1"
        class="mt-8 flex justify-center"
      >
        <div class="join">
          <button
            v-for="page in paginationPages"
            :key="page"
            class="join-item btn"
            :class="{ 'btn-active': page === pagination.page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// Notifications
const { error: showError } = useNotifications()

definePageMeta({
  title: 'Browse Services',
  description: 'Find and book professional services from verified contractors',
})

// Types
interface Service {
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
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// State
const services = ref<Service[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const maxPrice = ref('')
const sortBy = ref('createdAt')
const pagination = ref<Pagination | null>(null)

// Categories for filter dropdown
const categories = [
  'Web Development and IT',
  'Cleaning Services',
  'Computer/Internet',
  'Home Repair and Maintenance',
  'Beauty and Personal Care',
  'Transportation',
  'Education and Tutoring',
  'Business and Professional Services',
  'Event Services',
  'Health and Wellness',
]

// Search and filter handlers
let searchTimeout: NodeJS.Timeout

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchServices()
  }, 500)
}

const handleFilterChange = () => {
  fetchServices()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  maxPrice.value = ''
  sortBy.value = 'createdAt'
  fetchServices()
}

const changePage = (page: number) => {
  fetchServices(page)
}

// Computed pagination pages
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

// Fetch services function
const fetchServices = async (page = 1) => {
  loading.value = true

  try {
    const params = new URLSearchParams({
      page: page.toString(),
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
      params.append('priceTo', maxPrice.value)
    }

    const response = await $fetch(`/api/services/search?${params}`)
    services.value = response.services
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error fetching services:', error)
    showError(
      'Search Failed',
      'Unable to load services. Please check your connection and try again.'
    )
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchServices()
})
</script>
