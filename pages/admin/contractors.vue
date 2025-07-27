<template>
  <div class="container mx-auto py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Contractor Applications Management</h1>
      <p class="text-base-content/70 mt-2">
        Review and moderate contractor applications
      </p>
    </div>

    <!-- Filters -->
    <div class="card bg-base-100 mb-6 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4 text-lg">Filters</h2>
        <div class="flex flex-wrap gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Status</span>
            </label>
            <select
              v-model="filters.status"
              class="select select-bordered w-full max-w-xs"
              @change="() => loadContractors()"
            >
              <option value="">All Applications</option>
              <option value="0">Pending Review</option>
              <option value="1">Approved</option>
              <option value="-1">Rejected</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Page Size</span>
            </label>
            <select
              v-model="filters.limit"
              class="select select-bordered w-full max-w-xs"
              @change="() => loadContractors()"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Total Applications</div>
        <div class="stat-value text-primary">{{ stats.total }}</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Pending Review</div>
        <div class="stat-value text-warning">{{ stats.pending }}</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Approved</div>
        <div class="stat-value text-success">{{ stats.approved }}</div>
      </div>
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-title">Rejected</div>
        <div class="stat-value text-error">{{ stats.rejected }}</div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Contractors list -->
    <div v-else class="space-y-4">
      <div
        v-for="contractor in contractors"
        :key="contractor.id"
        class="card bg-base-100 shadow-xl"
      >
        <div class="card-body">
          <div class="mb-4 flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="avatar">
                <div class="h-12 w-12 rounded-full">
                  <img
                    v-if="contractor.user?.image"
                    :src="contractor.user.image"
                    :alt="`${contractor.user?.name || 'User'} avatar`"
                    class="h-full w-full rounded-full object-cover"
                    @error="(e) => onImageError(e, contractor)"
                  >
                  <div
                    v-else
                    class="bg-neutral text-neutral-content flex h-full w-full items-center justify-center rounded-full"
                  >
                    <span class="text-sm font-semibold">
                      {{
                        contractor.user?.name?.charAt(0).toUpperCase() || 'U'
                      }}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="font-semibold">
                  {{ contractor.user?.name || 'Unknown User' }}
                </h3>
                <p class="text-base-content/70 text-sm">
                  {{ contractor.user?.email }}
                </p>
                <p class="text-base-content/50 text-xs">
                  Applied:
                  {{ useDateFormat().formatDate(contractor.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Status badge -->
            <div class="badge" :class="getStatusBadgeClass(contractor.status)">
              {{ getStatusText(contractor.status) }}
            </div>
          </div>

          <!-- Application details -->
          <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="label">
                <span class="label-text font-semibold">Service Category</span>
              </label>
              <p class="text-sm">{{ contractor.categories }}</p>
            </div>

            <div v-if="contractor.price">
              <label class="label">
                <span class="label-text font-semibold">Pricing</span>
              </label>
              <p class="text-sm">{{ contractor.price }}</p>
            </div>
          </div>

          <div class="mb-4">
            <label class="label">
              <span class="label-text font-semibold">Service Description</span>
            </label>
            <p class="text-sm">{{ contractor.description }}</p>
          </div>

          <div v-if="contractor.experience" class="mb-4">
            <label class="label">
              <span class="label-text font-semibold">Experience</span>
            </label>
            <p class="text-sm">{{ contractor.experience }}</p>
          </div>

          <div v-if="contractor.portfolio" class="mb-4">
            <label class="label">
              <span class="label-text font-semibold">Portfolio</span>
            </label>
            <p class="text-sm">{{ contractor.portfolio }}</p>
          </div>

          <!-- Action buttons for pending applications -->
          <div
            v-if="contractor.status === 0"
            class="card-actions justify-end gap-2"
          >
            <button
              class="btn btn-error btn-sm"
              :disabled="isUpdating"
              @click="updateContractorStatus(contractor.id, -1)"
            >
              <Icon name="tabler:x" size="16" />
              Reject
            </button>
            <button
              class="btn btn-success btn-sm"
              :disabled="isUpdating"
              @click="updateContractorStatus(contractor.id, 1)"
            >
              <Icon name="tabler:check" size="16" />
              Approve
            </button>
          </div>

          <!-- Status change for approved/rejected -->
          <div v-else class="card-actions justify-end">
            <div class="dropdown dropdown-top dropdown-end">
              <div tabindex="0" role="button" class="btn btn-outline btn-sm">
                <Icon name="tabler:dots-vertical" size="16" />
                Change Status
              </div>
              <ul
                tabindex="0"
                class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
              >
                <li v-if="contractor.status !== 0">
                  <a @click="updateContractorStatus(contractor.id, 0)">
                    <Icon name="tabler:clock" size="16" />
                    Set to Pending
                  </a>
                </li>
                <li v-if="contractor.status !== 1">
                  <a @click="updateContractorStatus(contractor.id, 1)">
                    <Icon name="tabler:check" size="16" />
                    Approve
                  </a>
                </li>
                <li v-if="contractor.status !== -1">
                  <a @click="updateContractorStatus(contractor.id, -1)">
                    <Icon name="tabler:x" size="16" />
                    Reject
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!isLoading && contractors.length === 0"
      class="py-12 text-center"
    >
      <Icon
        name="tabler:users-group"
        size="64"
        class="text-base-content/30 mx-auto mb-4"
      />
      <h3 class="mb-2 text-lg font-semibold">No applications found</h3>
      <p class="text-base-content/70">
        {{
          filters.status !== ''
            ? 'No applications match the selected filter.'
            : 'No contractor applications have been submitted yet.'
        }}
      </p>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination && pagination.totalPages > 1"
      class="mt-8 flex justify-center"
    >
      <div class="join">
        <button
          class="join-item btn"
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
        >
          Previous
        </button>

        <button
          v-for="page in getVisiblePages()"
          :key="page"
          class="join-item btn"
          :class="{ 'btn-active': page === pagination.page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <button
          class="join-item btn"
          :disabled="pagination.page >= pagination.totalPages"
          @click="changePage(pagination.page + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Contractor, User } from '@prisma/client'
import { useNotifications } from '~/composables/useNotifications'

// Define contractor with user type
type ContractorWithUser = Contractor & {
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>
}

interface ContractorsResponse {
  success: boolean
  data: {
    contractors: ContractorWithUser[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

// Page meta
definePageMeta({
  layout: 'default',
  middleware: 'admin',
})

// Page head
useHead({
  title: 'Contractor Management - Admin',
})

const { success, error } = useNotifications()

// Reactive state
const contractors = ref<ContractorWithUser[]>([])
const isLoading = ref(false)
const isUpdating = ref(false)
const pagination = ref<ContractorsResponse['data']['pagination'] | null>(null)

const filters = ref({
  status: '',
  limit: 10,
})

const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
})

// Methods
const loadContractors = async (page = 1) => {
  try {
    isLoading.value = true

    const query = new URLSearchParams({
      page: page.toString(),
      limit: filters.value.limit.toString(),
      ...(filters.value.status && { status: filters.value.status }),
    })

    const response = await $fetch<ContractorsResponse>(
      `/api/admin/contractors?${query}`
    )

    contractors.value = response.data.contractors
    pagination.value = response.data.pagination

    // Update stats
    await loadStats()
  } catch (err: unknown) {
    console.error('Error loading contractors:', err)
    error('Failed to load contractor applications')
  } finally {
    isLoading.value = false
  }
}

const loadStats = async () => {
  try {
    const [totalRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
      $fetch<ContractorsResponse>('/api/admin/contractors?limit=1'),
      $fetch<ContractorsResponse>('/api/admin/contractors?status=0&limit=1'),
      $fetch<ContractorsResponse>('/api/admin/contractors?status=1&limit=1'),
      $fetch<ContractorsResponse>('/api/admin/contractors?status=-1&limit=1'),
    ])

    stats.value = {
      total: totalRes.data.pagination.total,
      pending: pendingRes.data.pagination.total,
      approved: approvedRes.data.pagination.total,
      rejected: rejectedRes.data.pagination.total,
    }
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

const updateContractorStatus = async (contractorId: number, status: number) => {
  try {
    isUpdating.value = true

    await $fetch(`/api/admin/contractors/${contractorId}`, {
      method: 'PATCH',
      body: { status },
    })

    // Reload current page
    await loadContractors(pagination.value?.page || 1)

    const statusText =
      status === 1 ? 'approved' : status === -1 ? 'rejected' : 'set to pending'
    success(`Contractor application ${statusText} successfully`)
  } catch (err: unknown) {
    console.error('Error updating contractor status:', err)
    error('Failed to update contractor status')
  } finally {
    isUpdating.value = false
  }
}

const changePage = (page: number) => {
  if (page >= 1 && pagination.value && page <= pagination.value.totalPages) {
    loadContractors(page)
  }
}

const getVisiblePages = (): number[] => {
  if (!pagination.value) return []

  const { page, totalPages } = pagination.value
  const pages: number[] = []

  // Show up to 5 pages around current page
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}

// Image error handling
const onImageError = (event: Event, contractor: ContractorWithUser) => {
  console.warn(
    `Failed to load avatar image for user ${contractor.user?.name || contractor.userId}`
  )
  if (contractor.user) {
    // Remove the image URL to fallback to placeholder
    contractor.user.image = null
  }
}

// Utility functions
const getStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Pending Review'
    case 1:
      return 'Approved'
    case -1:
      return 'Rejected'
    default:
      return 'Unknown'
  }
}

const getStatusBadgeClass = (status: number): string => {
  switch (status) {
    case 0:
      return 'badge-warning'
    case 1:
      return 'badge-success'
    case -1:
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
}

// Load data on mount
onMounted(() => {
  loadContractors()
})
</script>
