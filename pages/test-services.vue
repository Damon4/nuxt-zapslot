<template>
  <div class="container mx-auto p-6">
    <h1 class="mb-6 text-3xl font-bold">Services API Test</h1>

    <!-- Create Service Form -->
    <div class="bg-base-200 mb-6 rounded-lg p-6">
      <h2 class="mb-4 text-xl font-semibold">Create New Service</h2>
      <form class="space-y-4" @submit.prevent="createTestService">
        <div>
          <label class="label">
            <span class="label-text">Title</span>
          </label>
          <input
            v-model="newService.title"
            type="text"
            class="input input-bordered w-full"
            placeholder="Service title (min 10 chars)"
            required
          >
        </div>

        <div>
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            v-model="newService.description"
            class="textarea textarea-bordered w-full"
            placeholder="Service description (min 50 chars)"
            rows="3"
            required
          />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="label">
              <span class="label-text">Category</span>
            </label>
            <select
              v-model="newService.category"
              class="select select-bordered w-full"
              required
            >
              <option value="">Select category</option>
              <option value="Computer/Internet">Computer/Internet</option>
              <option value="Cleaning Services">Cleaning Services</option>
              <option value="Auto Services">Auto Services</option>
              <option value="Design/Creative">Design/Creative</option>
              <option value="Other Services">Other Services</option>
            </select>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Price Type</span>
            </label>
            <select
              v-model="newService.priceType"
              class="select select-bordered w-full"
            >
              <option value="FIXED">Fixed Price</option>
              <option value="HOURLY">Hourly Rate</option>
              <option value="NEGOTIABLE">Negotiable</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="label">
              <span class="label-text">Price (optional)</span>
            </label>
            <input
              v-model.number="newService.price"
              type="number"
              step="0.01"
              class="input input-bordered w-full"
              placeholder="0.00"
            >
          </div>

          <div>
            <label class="label">
              <span class="label-text">Duration (minutes, optional)</span>
            </label>
            <input
              v-model.number="newService.duration"
              type="number"
              class="input input-bordered w-full"
              placeholder="60"
            >
          </div>
        </div>

        <div>
          <label class="label">
            <span class="label-text">Availability</span>
          </label>
          <select
            v-model="newService.availability"
            class="select select-bordered w-full"
          >
            <option value="FLEXIBLE">Flexible</option>
            <option value="WEEKDAYS">Weekdays</option>
            <option value="WEEKENDS">Weekends</option>
            <option value="MORNINGS">Mornings</option>
            <option value="EVENINGS">Evenings</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner"/>
          Create Service
        </button>
      </form>
    </div>

    <!-- Services List -->
    <div class="bg-base-200 mb-6 rounded-lg p-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold">My Services</h2>
        <button class="btn btn-outline btn-sm" @click="loadServices">
          <span v-if="isLoading" class="loading loading-spinner"/>
          Refresh
        </button>
      </div>

      <div v-if="error" class="alert alert-error mb-4">
        <span>{{ error }}</span>
      </div>

      <div
        v-if="services.length === 0 && !isLoading"
        class="text-base-content/70 py-8 text-center"
      >
        No services found. Create your first service above!
      </div>

      <div class="grid gap-4">
        <div
          v-for="service in services"
          :key="service.id"
          class="card bg-base-100 shadow-xl"
        >
          <div class="card-body">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="card-title">{{ service.title }}</h3>
                <p class="mb-2 text-sm opacity-70">{{ service.description }}</p>
                <div class="mb-2 flex gap-2">
                  <div class="badge badge-primary">{{ service.category }}</div>
                  <div class="badge badge-outline">{{ service.priceType }}</div>
                  <div
                    class="badge"
                    :class="service.isActive ? 'badge-success' : 'badge-error'"
                  >
                    {{ service.isActive ? 'Active' : 'Inactive' }}
                  </div>
                </div>
                <div class="space-y-1 text-sm">
                  <div v-if="service.price">
                    <strong>Price:</strong> ${{ service.price }}
                  </div>
                  <div v-if="service.duration">
                    <strong>Duration:</strong> {{ service.duration }} minutes
                  </div>
                  <div>
                    <strong>Availability:</strong> {{ service.availability }}
                  </div>
                  <div v-if="service.bookingsCount !== undefined">
                    <strong>Bookings:</strong> {{ service.bookingsCount }}
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="btn btn-sm"
                  :class="service.isActive ? 'btn-warning' : 'btn-success'"
                  @click="toggleService(service.id)"
                >
                  {{ service.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button
                  class="btn btn-sm btn-error"
                  @click="deleteService(service.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Services -->
    <div class="bg-base-200 rounded-lg p-6">
      <h2 class="mb-4 text-xl font-semibold">Search Public Services</h2>
      <div class="mb-4 flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          class="input input-bordered flex-1"
          placeholder="Search services..."
        >
        <button class="btn btn-primary" @click="searchServices">Search</button>
      </div>

      <div v-if="searchResults.length > 0" class="grid gap-4">
        <div
          v-for="service in searchResults"
          :key="service.id"
          class="card bg-base-100 shadow"
        >
          <div class="card-body">
            <h3 class="card-title">{{ service.title }}</h3>
            <p class="text-sm">{{ service.description }}</p>
            <div class="mt-2 flex gap-2">
              <div class="badge badge-primary">{{ service.category }}</div>
              <div v-if="service.price" class="badge badge-outline">
                ${{ service.price }} ({{ service.priceType }})
              </div>
            </div>
            <div v-if="service.contractor" class="mt-2 text-sm">
              <strong>Contractor:</strong> {{ service.contractor.user.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const {
  services,
  isLoading,
  error,
  fetchContractorServices,
  createService,
  deleteService,
  toggleService,
  searchServices: searchServicesAPI,
} = useServices()

// Form data
const newService = ref({
  title: '',
  description: '',
  category: '',
  price: null,
  priceType: 'FIXED',
  duration: null,
  availability: 'FLEXIBLE',
})

// Search
const searchQuery = ref('')
const searchResults = ref([])

// Methods
const createTestService = async () => {
  try {
    await createService(newService.value)
    // Reset form
    newService.value = {
      title: '',
      description: '',
      category: '',
      price: null,
      priceType: 'FIXED',
      duration: null,
      availability: 'FLEXIBLE',
    }
  } catch (err) {
    console.error('Error creating service:', err)
  }
}

const loadServices = async () => {
  try {
    await fetchContractorServices()
  } catch (err) {
    console.error('Error loading services:', err)
  }
}

const searchServices = async () => {
  try {
    const result = await searchServicesAPI({ q: searchQuery.value })
    searchResults.value = result.services
  } catch (err) {
    console.error('Error searching services:', err)
  }
}

// Load services on mount
onMounted(() => {
  loadServices()
})
</script>
