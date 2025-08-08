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
          <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
            <!-- Search Input with suggestions -->
            <div class="form-control relative">
              <label class="label">
                <span class="label-text">Search services</span>
              </label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Web development, cleaning..."
                class="input input-bordered"
                @input="
                  (e) => {
                    debouncedSearch()
                    showSuggestions = true
                    fetchSuggestions()
                  }
                "
                @focus="onSearchFocus"
                @blur="hideSuggestionsSoon"
              >
              <div
                v-if="showSuggestions && suggestions"
                class="absolute left-0 right-0 top-full z-20 mt-1"
              >
                <ul class="menu rounded-box bg-base-300 p-2 shadow">
                  <li v-for="t in suggestions.titles" :key="`t-${t}`">
                    <a
                      @mousedown.prevent="
                        searchQuery = t
                        debouncedSearch()
                        showSuggestions = false
                      "
                      >{{ t }}</a
                    >
                  </li>
                  <li v-if="suggestions.categories.length" class="menu-title">
                    <span>Categories</span>
                  </li>
                  <li v-for="c in suggestions.categories" :key="`c-${c}`">
                    <a
                      @mousedown.prevent="
                        selectedCategory = c
                        handleFilterChange()
                        showSuggestions = false
                      "
                      >{{ c }}</a
                    >
                  </li>
                  <li v-if="suggestions.locations.length" class="menu-title">
                    <span>Locations</span>
                  </li>
                  <li v-for="l in suggestions.locations" :key="`l-${l}`">
                    <a
                      @mousedown.prevent="
                        location = l
                        handleFilterChange()
                        showSuggestions = false
                      "
                      >{{ l }}</a
                    >
                  </li>
                </ul>
              </div>
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
                  :key="category.id"
                  :value="category.name"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Price Range (Max) -->
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

            <!-- Min Price -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Min Price</span>
              </label>
              <input
                v-model="minPrice"
                type="number"
                placeholder="0"
                class="input input-bordered"
                @input="handleFilterChange"
              >
            </div>

            <!-- Rating Filter -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Min Rating</span>
              </label>
              <select
                v-model="minRating"
                class="select select-bordered"
                @change="handleFilterChange"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
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
                <option value="rating">Highest Rated</option>
                <option value="price">Price: Low to High</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>

            <!-- Availability -->
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text">Availability</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <label class="label cursor-pointer gap-2">
                  <input
                    v-model="availability"
                    type="checkbox"
                    value="WEEKDAYS"
                    class="checkbox"
                    @change="handleFilterChange"
                  >
                  <span class="label-text">Weekdays</span>
                </label>
                <label class="label cursor-pointer gap-2">
                  <input
                    v-model="availability"
                    type="checkbox"
                    value="WEEKENDS"
                    class="checkbox"
                    @change="handleFilterChange"
                  >
                  <span class="label-text">Weekends</span>
                </label>
                <label class="label cursor-pointer gap-2">
                  <input
                    v-model="availability"
                    type="checkbox"
                    value="MORNINGS"
                    class="checkbox"
                    @change="handleFilterChange"
                  >
                  <span class="label-text">Mornings</span>
                </label>
                <label class="label cursor-pointer gap-2">
                  <input
                    v-model="availability"
                    type="checkbox"
                    value="EVENINGS"
                    class="checkbox"
                    @change="handleFilterChange"
                  >
                  <span class="label-text">Evenings</span>
                </label>
                <label class="label cursor-pointer gap-2">
                  <input
                    v-model="availability"
                    type="checkbox"
                    value="FLEXIBLE"
                    class="checkbox"
                    @change="handleFilterChange"
                  >
                  <span class="label-text">Flexible</span>
                </label>
              </div>
            </div>

            <!-- Location -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Location</span>
              </label>
              <input
                v-model="location"
                type="text"
                placeholder="City or Area"
                class="input input-bordered"
                @input="handleFilterChange"
              >
            </div>

            <!-- Min Reviews -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Min Reviews</span>
              </label>
              <input
                v-model="minReviewCount"
                type="number"
                min="0"
                placeholder="0"
                class="input input-bordered"
                @input="handleFilterChange"
              >
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
        v-else-if="hasResults"
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
      <div v-if="hasMultiplePages" class="mt-8 flex justify-center">
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
import { onMounted, ref } from 'vue'

// Import custom composables
const { categories } = useCategories()
const {
  services,
  loading,
  searchQuery,
  selectedCategory,
  maxPrice,
  minPrice,
  minRating,
  minReviewCount,
  location,
  availability,
  sortBy,
  pagination,
  paginationPages,
  hasResults,
  hasMultiplePages,
  debouncedSearch,
  saveCurrentSearch,
  getSavedSearches,
  handleFilterChange,
  changePage,
  clearFilters,
  suggestions,
  showSuggestions,
  fetchSuggestions,
} = useServicesSearch()

definePageMeta({
  title: 'Browse Services',
  description: 'Find and book professional services from verified contractors',
})

// Initialize from URL parameters once
onMounted(() => {
  const route = useRoute()

  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }

  if (route.query.category && categories.value.length > 0) {
    const categoryId = parseInt(route.query.category as string)
    if (categoryId) {
      const category = categories.value.find(
        (cat: { id: number; name: string }) => cat.id === categoryId
      )
      if (category) {
        selectedCategory.value = category.name
      }
    }
  }

  if (route.query.priceTo) {
    maxPrice.value = route.query.priceTo as string
  }

  if (route.query.minRating) {
    minRating.value = route.query.minRating as string
  }

  if (route.query.sortBy) {
    sortBy.value = route.query.sortBy as
      | 'price'
      | 'createdAt'
      | 'title'
      | 'rating'
  }
})

// Handlers for search input focus/blur to control suggestions dropdown
const onSearchFocus = () => {
  showSuggestions.value = true
  if ((searchQuery.value || '').trim().length) {
    // fire and forget
    fetchSuggestions()
  }
}

const hideSuggestionsSoon = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 120)
}

// Saved searches local list
type SavedSearch = {
  q: string
  category: string
  priceFrom: string
  priceTo: string
  minRating: string
  minReviewCount: string
  location: string
  availability: string[]
  sortBy: 'price' | 'createdAt' | 'title' | 'rating'
  ts: number
}

const savedSearches = ref<SavedSearch[]>(getSavedSearches())

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onSaveSearch = () => {
  saveCurrentSearch()
  savedSearches.value = getSavedSearches()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadSavedSearch = (item: SavedSearch) => {
  searchQuery.value = item.q
  selectedCategory.value = item.category
  minPrice.value = item.priceFrom
  maxPrice.value = item.priceTo
  minRating.value = item.minRating
  minReviewCount.value = item.minReviewCount
  location.value = item.location
  availability.value = [...item.availability]
  sortBy.value = item.sortBy
  handleFilterChange()
}
</script>
