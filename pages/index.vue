<template>
  <div>
    <!-- Hero Section -->
    <section
      class="hero from-primary/10 via-base-100 to-secondary/10 min-h-screen bg-gradient-to-br"
    >
      <div class="hero-content max-w-6xl text-center">
        <div>
          <h1
            class="from-primary to-secondary bg-gradient-to-r bg-clip-text text-6xl font-bold text-transparent"
          >
            Find & Book Services
          </h1>
          <h2 class="text-base-content/80 mt-4 text-3xl font-semibold">
            Instantly with ZapSlot
          </h2>
          <p class="text-base-content/70 mx-auto max-w-2xl py-6 text-lg">
            Connect with verified professionals for all your service needs. From
            home repairs to web development - book instantly with immediate
            confirmation.
          </p>

          <!-- Search Bar with suggestions -->
          <div class="mx-auto mb-8 flex max-w-2xl flex-col gap-4 sm:flex-row">
            <div class="form-control relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="What service do you need?"
                class="input input-bordered input-lg w-full"
                @input="onSearchInput"
                @focus="onSearchFocus"
                @blur="hideSuggestionsSoon"
                @keyup.enter="searchServices"
              >
              <div
                v-if="showSuggestions && suggestions"
                class="absolute left-0 right-0 top-full z-20 mt-1"
              >
                <ul class="menu rounded-box bg-base-300 p-2 shadow">
                  <li v-for="t in suggestions.titles" :key="`t-${t}`">
                    <a @mousedown.prevent="onSuggestionTitleClick(t)">{{
                      t
                    }}</a>
                  </li>
                </ul>
              </div>
            </div>
            <button class="btn btn-primary btn-lg px-8" @click="searchServices">
              <Icon name="heroicons:magnifying-glass" class="h-5 w-5" />
              Search
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <NuxtLink to="/services" class="btn btn-primary btn-lg">
              <Icon name="heroicons:sparkles" class="h-5 w-5" />
              Browse All Services
            </NuxtLink>
            <button class="btn btn-outline btn-lg" @click="contractorAction">
              <Icon name="heroicons:briefcase" class="h-5 w-5" />
              Become a Contractor
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="bg-base-200 py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          <div class="stat">
            <div class="stat-value text-primary">{{ stats.contractors }}+</div>
            <div class="stat-title">Active Contractors</div>
          </div>
          <div class="stat">
            <div class="stat-value text-secondary">{{ stats.services }}+</div>
            <div class="stat-title">Available Services</div>
          </div>
          <div class="stat">
            <div class="stat-value text-accent">{{ stats.bookings }}+</div>
            <div class="stat-title">Completed Bookings</div>
          </div>
          <div class="stat">
            <div class="stat-value text-info">{{ stats.categories }}+</div>
            <div class="stat-title">Service Categories</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Categories -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold">Popular Categories</h2>
          <p class="text-base-content/70 mx-auto max-w-2xl text-lg">
            Explore our most requested service categories
          </p>
        </div>

        <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <!-- Loading state for categories -->
          <template v-if="categoriesLoading">
            <div
              v-for="n in 8"
              :key="`skeleton-${n}`"
              class="card bg-base-100 shadow-lg"
            >
              <div class="card-body items-center p-6 text-center">
                <div class="skeleton mb-3 h-12 w-12 rounded-full" />
                <div class="skeleton h-4 w-20" />
                <div class="skeleton h-3 w-16" />
              </div>
            </div>
          </template>

          <!-- Real categories -->
          <template v-else>
            <div
              v-for="category in popularCategories"
              :key="category.id"
              class="card bg-base-100 group cursor-pointer shadow-lg transition-all hover:shadow-xl"
              @click="navigateToCategory(category.id)"
            >
              <div class="card-body items-center p-6 text-center">
                <div
                  class="mb-3 text-4xl transition-transform group-hover:scale-110"
                >
                  {{ category.icon }}
                </div>
                <h3 class="card-title text-sm">{{ category.name }}</h3>
                <p class="text-base-content/60 text-xs">
                  {{ category.count }} services
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="bg-base-200 py-16">
      <div class="container mx-auto px-4">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold">How It Works</h2>
          <p class="text-base-content/70 mx-auto max-w-2xl text-lg">
            Book professional services in three simple steps
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-3">
          <div class="text-center">
            <div
              class="bg-primary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
            >
              <Icon
                name="heroicons:magnifying-glass"
                class="!size-8 text-white"
              />
            </div>
            <h3 class="mb-2 text-xl font-semibold">1. Search & Find</h3>
            <p class="text-base-content/70">
              Browse through hundreds of verified service providers in your area
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
            >
              <Icon name="heroicons:calendar-days" class="!size-8 text-white" />
            </div>
            <h3 class="mb-2 text-xl font-semibold">2. Book Instantly</h3>
            <p class="text-base-content/70">
              Select your preferred time slot and get immediate confirmation
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-accent mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
            >
              <Icon name="heroicons:check-circle" class="!size-8 text-white" />
            </div>
            <h3 class="mb-2 text-xl font-semibold">3. Get Service</h3>
            <p class="text-base-content/70">
              Professional service delivery at your scheduled time
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Services -->
    <section v-if="featuredServices.length > 0" class="py-16">
      <div class="container mx-auto px-4">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold">Featured Services</h2>
          <p class="text-base-content/70 mx-auto max-w-2xl text-lg">
            Top-rated services from our best contractors
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            v-for="service in featuredServices"
            :key="service.id"
            :service="service"
          />
        </div>

        <div class="mt-8 text-center">
          <NuxtLink to="/services" class="btn btn-primary btn-lg">
            View All Services
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="from-primary to-secondary bg-gradient-to-r py-16">
      <div class="container mx-auto px-4 text-center">
        <div class="mx-auto max-w-3xl text-white">
          <h2 class="mb-4 text-4xl font-bold">Ready to Get Started?</h2>
          <p class="mb-8 text-xl opacity-90">
            Join thousands of satisfied customers and professional service
            providers
          </p>

          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <NuxtLink
              to="/services"
              class="btn btn-outline btn-lg hover:text-primary border-white text-white hover:bg-white"
            >
              Book a Service
            </NuxtLink>
            <button
              class="btn btn-white btn-lg text-primary"
              @click="contractorAction"
            >
              Start Earning Today
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Meta tags
useSeoMeta({
  title: 'ZapSlot - Book Professional Services Instantly',
  description:
    'Connect with verified professionals for all your service needs. From home repairs to web development - book instantly with immediate confirmation.',
})

// Composables
const { categories, loading: categoriesLoading } = useCategories()

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
  averageRating: number
  reviewCount: number
}

// Reactive data
const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestions = ref<{ titles: string[] } | null>(null)

const stats = reactive({
  contractors: 12,
  services: 25,
  bookings: 150,
  categories: 20,
})

// Helper functions for emoji extraction
const extractEmojiAndName = (categoryName: string) => {
  // More comprehensive regex for emojis
  const emojiRegex =
    /^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])+\s*/u
  const match = categoryName.match(emojiRegex)

  const emoji = match ? match[0].trim() : '📋'
  const name = categoryName.replace(emojiRegex, '').trim()

  return { emoji, name }
}

const popularCategories = computed(() => {
  // Select specific categories with diverse icons for better visual appeal
  const preferredCategoryNames = [
    '🔨 Repair and Construction',
    '💻 Computer Assistance',
    '🧹 Cleaning Services',
    '🎨 Design and Interior',
    '🚗 Auto Services',
    '💄 Beauty and Health',
    '📚 Tutoring and Education',
    '🎉 Event Organization',
  ]

  const selectedCategories: Array<{
    id: number
    name: string
    icon: string
    count: number
  }> = []

  // First, try to find preferred categories
  preferredCategoryNames.forEach((prefName) => {
    const found = categories.value.find((cat) => cat.name === prefName)
    if (found && selectedCategories.length < 8) {
      const { emoji, name } = extractEmojiAndName(found.name)
      selectedCategories.push({
        id: found.id,
        name,
        icon: emoji,
        count: found.serviceCount,
      })
    }
  })

  // Fill remaining slots with other categories if needed
  if (selectedCategories.length < 8) {
    categories.value.forEach((category) => {
      if (selectedCategories.length >= 8) return

      const alreadyAdded = selectedCategories.some(
        (sc) => sc.id === category.id
      )
      if (!alreadyAdded) {
        const { emoji, name } = extractEmojiAndName(category.name)
        selectedCategories.push({
          id: category.id,
          name,
          icon: emoji,
          count: category.serviceCount,
        })
      }
    })
  }

  return selectedCategories.slice(0, 8)
})

const featuredServices = ref<Service[]>([])

// Computed properties
const contractorAction = computed(() => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    // For unauthenticated users, trigger sign in
    return () => {
      const authStore = useAuthStore()
      authStore.signIn()
    }
  } else {
    // For authenticated users, navigate to profile
    return () => navigateTo('/profile')
  }
})

// Methods
const searchServices = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/services?search=${encodeURIComponent(searchQuery.value)}`)
  } else {
    navigateTo('/services')
  }
}

const navigateToCategory = (categoryId: number) => {
  navigateTo(`/services?category=${categoryId}`)
}

// Load services data
onMounted(async () => {
  try {
    const servicesResponse = (await $fetch('/api/services', {
      query: { limit: 6 },
    })) as unknown
    const raw = (servicesResponse as Record<string, unknown>)?.services as
      | unknown[]
      | undefined
    featuredServices.value = (raw || []).map((item) => {
      const s = item as Record<string, unknown>
      const contractor = s.contractor as Record<string, unknown>
      const user = (contractor?.user || {}) as Record<string, unknown>
      const count = (s._count || {}) as Record<string, unknown>
      return {
        id: Number(s.id as number),
        title: s.title as string,
        description: s.description as string,
        category: s.category as string,
        price: (s.price as string | null) ?? null,
        priceType: s.priceType as string,
        duration: (s.duration as number | null) ?? null,
        availability: s.availability as string,
        contractor: {
          user: {
            name: (user.name as string) || '',
            image: (user.image as string) || null,
          },
        },
        bookingsCount:
          (s.bookingsCount as number) ?? (count.bookings as number) ?? 0,
        averageRating: (s.averageRating as number) ?? 0,
        reviewCount:
          (s.reviewCount as number) ?? (count.reviews as number) ?? 0,
      }
    })

    // Load platform stats
    const statsResponse = await $fetch('/api/platform/stats').catch(() => null)
    if (statsResponse) {
      Object.assign(stats, statsResponse)
    }
  } catch {
    console.log('Stats not available, using mock data')
  }
})

// Suggestions helpers (lightweight fetch)
const fetchHomeSuggestions = async (force = false) => {
  const q = (searchQuery.value || '').trim()
  if (!q && !force) {
    suggestions.value = null
    return
  }
  try {
    const res = await $fetch<{ titles: string[] }>(
      `/api/services/suggestions?q=${encodeURIComponent(q)}`
    )
    suggestions.value = res ?? null
  } catch {
    suggestions.value = null
  }
}

const onSearchFocus = () => {
  showSuggestions.value = true
  fetchHomeSuggestions(true)
}
const hideSuggestionsSoon = () => {
  setTimeout(() => (showSuggestions.value = false), 120)
}
const onSearchInput = () => {
  showSuggestions.value = true
  fetchHomeSuggestions()
}
const onSuggestionTitleClick = (t: string) => {
  searchQuery.value = t
  showSuggestions.value = false
  searchServices()
}
</script>
