<script setup lang="ts">
import AnalyticsAreaCard from '~/components/charts/AnalyticsAreaCard.vue'

definePageMeta({ middleware: ['contractor'] })

interface TopByBookings {
  serviceId: number
  title: string
  bookingsCount: number
}
interface TopByRevenue {
  serviceId: number
  title: string
  revenue: number
}
interface TopByRating {
  serviceId: number
  title: string
  averageRating: number
  reviewCount: number
}

type Range = 'thisWeek' | 'last7d' | 'last14d' | 'last30d' | 'last90d'

interface SummaryResponse {
  success: boolean
  data: {
    range: { from: string; to: string }
    totals: {
      period: { bookings: number; cancellations: number; revenue: number }
      allTime: { bookings: number; cancellations: number; revenue: number }
    }
    topServices: {
      byBookings: TopByBookings[]
      byRevenue: TopByRevenue[]
      byRating: TopByRating[]
    }
  }
}

interface TrendsResponse {
  success: boolean
  data: {
    from: string
    to: string
    interval: 'day' | 'week'
    series: {
      from: string
      to: string
      bookings: number
      cancellations: number
      revenue: number
    }[]
  }
}

const range = ref<Range>('thisWeek')

// Summary data
const { data, pending, error, refresh } = useFetch<SummaryResponse>(
  '/api/contractor/analytics/summary',
  {
    query: computed(() => ({ range: range.value })),
  }
)

// Chart interval logic
const chartInterval = computed<'day' | 'week'>(() =>
  ['thisWeek', 'last7d', 'last14d'].includes(range.value) ? 'day' : 'week'
)

// Trends data
const {
  data: trendsData,
  pending: trendsPending,
  error: trendsError,
  refresh: refreshTrends,
} = useFetch<TrendsResponse>('/api/contractor/analytics/trends', {
  query: computed(() => ({
    interval: chartInterval.value,
    from: data.value?.data?.range.from,
    to: data.value?.data?.range.to,
  })),
})

// Watch range changes
watch(range, () => {
  refresh()
  refreshTrends()
})

// Format currency
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    n || 0
  )

// Chart data
const chartData = computed(() => {
  const series = trendsData.value?.data?.series || []
  return series.map((s, i) => ({
    bookings: s.bookings,
    revenue: s.revenue,
    label: `D${i + 1}`, // Simple labels for demo
  }))
})

// Categories for charts
const bookingsCategories = {
  bookings: { name: 'Bookings', color: '#3b82f6' },
}

const revenueCategories = {
  revenue: { name: 'Revenue', color: '#10b981' },
}

// Demo data with realistic dates based on period
const getDemoData = (period: Range, interval: 'day' | 'week') => {
  const today = new Date()
  const demoData = []

  if (period === 'thisWeek' && interval === 'day') {
    // Special handling for "This week" - show Monday to current day
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : -(currentDay - 1) // Get Monday of this week

    // Calculate how many days from Monday to today (inclusive)
    const daysFromMondayToToday = currentDay === 0 ? 7 : currentDay // Sunday = 7 days, others = currentDay

    for (let i = 0; i < daysFromMondayToToday; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + mondayOffset + i) // Monday + i days

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const monthDay = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })

      // Generate realistic data with some variation
      const seed = i * 0.8

      demoData.push({
        bookings: Math.round(Math.abs(Math.sin(seed)) * 5) + 1,
        revenue: Math.round(Math.abs(Math.cos(seed)) * 200) + 100,
        date: date.toISOString().split('T')[0] || '', // YYYY-MM-DD format
        dayLabel: dayName,
        fullLabel: `${dayName}, ${monthDay}`,
      })
    }

    return demoData
  }

  // For all other periods, use the existing logic
  let dataPoints = 7 // default for last7d

  switch (period) {
    case 'thisWeek': // Already handled above
    case 'last7d':
      dataPoints = 7
      break
    case 'last14d':
      dataPoints = 14
      break
    case 'last30d':
      dataPoints = interval === 'day' ? 30 : 5 // 5 weeks for weekly view
      break
    case 'last90d':
      dataPoints = interval === 'day' ? 90 : 13 // 13 weeks for weekly view
      break
  }

  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(today)

    if (interval === 'day') {
      date.setDate(date.getDate() - i)
    } else {
      // For weekly interval, go back by weeks
      date.setDate(date.getDate() - i * 7)
    }

    let label = ''
    let fullLabel = ''

    if (interval === 'day') {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const monthDay = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      label = dayName
      fullLabel = `${dayName}, ${monthDay}`
    } else {
      // For weekly interval, show week ranges
      const weekStart = new Date(date)
      const weekEnd = new Date(date)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const startMonth = weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      const endMonth = weekEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      label = `W${dataPoints - i}`
      fullLabel = `${startMonth} - ${endMonth}`
    }

    // Generate realistic data with some variation
    const seed = i * 0.8
    const bookingMultiplier = interval === 'week' ? 7 : 1 // More bookings for weekly data
    const revenueMultiplier = interval === 'week' ? 7 : 1

    demoData.push({
      bookings:
        Math.round(Math.abs(Math.sin(seed)) * 5 * bookingMultiplier) +
        bookingMultiplier,
      revenue:
        Math.round(Math.abs(Math.cos(seed)) * 200 * revenueMultiplier) +
        100 * revenueMultiplier,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      dayLabel: label,
      fullLabel: fullLabel,
    })
  }

  return demoData
}

// Generate demo data based on current range and interval
const demoData = computed(() => getDemoData(range.value, chartInterval.value))

const xFormatter = (tick: number) =>
  demoData.value[tick]?.dayLabel || `Point ${tick + 1}`

// Y-axis formatters
const bookingsFormatter = (value: number) =>
  `${value} booking${value !== 1 ? 's' : ''}`
const revenueFormatter = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

// Titles
const bookingsTitle =
  chartInterval.value === 'day' ? 'Daily Bookings' : 'Weekly Bookings'
const revenueTitle =
  chartInterval.value === 'day' ? 'Daily Revenue' : 'Weekly Revenue'
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Analytics</h1>
      <select v-model="range" class="select select-bordered w-44">
        <option value="thisWeek">This week</option>
        <option value="last7d">Last 7 days</option>
        <option value="last14d">Last 14 days</option>
        <option value="last30d">Last 30 days</option>
        <option value="last90d">Last 90 days</option>
      </select>
    </div>

    <div v-if="pending" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="error" class="alert alert-error">
      <span>{{
        (error as any)?.statusMessage || 'Failed to load analytics'
      }}</span>
    </div>

    <div v-else class="space-y-8">
      <!-- Charts -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsAreaCard
          :title="bookingsTitle"
          :data="chartData"
          :categories="bookingsCategories"
          :x-formatter="xFormatter"
          :y-formatter="bookingsFormatter"
          x-label="Day"
          y-label="Count"
          :loading="trendsPending"
          :error-message="(trendsError as any)?.statusMessage || null"
          :demo-data="demoData"
          :use-demo="true"
        />
        <AnalyticsAreaCard
          :title="revenueTitle"
          :data="chartData"
          :categories="revenueCategories"
          :x-formatter="xFormatter"
          :y-formatter="revenueFormatter"
          x-label="Day"
          y-label="Revenue"
          :loading="trendsPending"
          :error-message="(trendsError as any)?.statusMessage || null"
          :demo-data="demoData"
          :use-demo="true"
        />
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">Bookings (period)</h2>
            <p class="text-3xl font-semibold">
              {{ data?.data?.totals?.period?.bookings ?? 0 }}
            </p>
            <p class="text-sm opacity-70">
              All-time: {{ data?.data?.totals?.allTime?.bookings ?? 0 }}
            </p>
          </div>
        </div>
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">Revenue (period)</h2>
            <p class="text-3xl font-semibold">
              {{ formatCurrency(data?.data?.totals?.period?.revenue ?? 0) }}
            </p>
            <p class="text-sm opacity-70">
              All-time:
              {{ formatCurrency(data?.data?.totals?.allTime?.revenue ?? 0) }}
            </p>
          </div>
        </div>
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">Cancellations (period)</h2>
            <p class="text-3xl font-semibold">
              {{ data?.data?.totals?.period?.cancellations ?? 0 }}
            </p>
            <p class="text-sm opacity-70">
              All-time: {{ data?.data?.totals?.allTime?.cancellations ?? 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Top services tables -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title">Top by Bookings</h3>
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th class="text-right">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="i in (data?.data?.topServices
                      ?.byBookings as TopByBookings[]) || []"
                    :key="i.serviceId"
                  >
                    <td class="truncate">{{ i.title }}</td>
                    <td class="text-right">{{ i.bookingsCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title">Top by Revenue</h3>
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th class="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="i in (data?.data?.topServices
                      ?.byRevenue as TopByRevenue[]) || []"
                    :key="i.serviceId"
                  >
                    <td class="truncate">{{ i.title }}</td>
                    <td class="text-right">{{ formatCurrency(i.revenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title">Top by Rating</h3>
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th class="text-right">Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="i in (data?.data?.topServices
                      ?.byRating as TopByRating[]) || []"
                    :key="i.serviceId"
                  >
                    <td class="truncate">{{ i.title }}</td>
                    <td class="text-right">
                      {{ (i.averageRating || 0).toFixed(2) }} ({{
                        i.reviewCount
                      }})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.truncate {
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
