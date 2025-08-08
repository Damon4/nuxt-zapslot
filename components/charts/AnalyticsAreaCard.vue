<script setup lang="ts">
import BaseAreaChart from '~/components/charts/BaseAreaChart.vue'

interface CategoryDef {
  name: string
  color: string
}

interface DataPoint {
  [key: string]: number | string
}

interface Props {
  title: string
  data: DataPoint[]
  categories: Record<string, CategoryDef>
  xFormatter?: (tick: number) => string
  yFormatter?: (value: number) => string
  xLabel?: string
  yLabel?: string
  height?: number
  loading?: boolean
  errorMessage?: string | null
  demoData?: DataPoint[]
  useDemo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  xLabel: '',
  yLabel: '',
  xFormatter: undefined,
  yFormatter: undefined,
  loading: false,
  errorMessage: null,
  demoData: () => [],
  useDemo: false,
})

// Simple data selection - use demo if forced or if no real data
const chartData = computed(() => {
  return props.useDemo || !props.data?.length ? props.demoData : props.data
})

const showChart = computed(() => {
  return !props.loading && !props.errorMessage && chartData.value.length > 0
})
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title">{{ props.title }}</h3>

      <div
        v-if="props.loading"
        class="flex items-center justify-center"
        :style="{ height: `${props.height}px` }"
      >
        <span class="loading loading-spinner loading-lg" />
      </div>

      <div v-else-if="props.errorMessage" class="alert alert-error">
        <span>{{ props.errorMessage }}</span>
      </div>

      <BaseAreaChart
        v-else-if="showChart"
        :data="chartData"
        :categories="props.categories"
        :height="props.height"
        :x-formatter="props.xFormatter"
        :y-formatter="props.yFormatter"
        :x-label="props.xLabel"
        :y-label="props.yLabel"
      />

      <div
        v-else
        class="flex items-center justify-center"
        :style="{ height: `${props.height}px` }"
      >
        <span class="text-base-content/60">No data available</span>
      </div>
    </div>
  </div>
</template>
