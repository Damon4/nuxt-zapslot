<script setup lang="ts">
import { AreaChart } from '#components'

interface CategoryDef {
  name: string
  color: string
}

interface DataPoint {
  [key: string]: number | string
}

interface Props {
  data: DataPoint[]
  categories: Record<string, CategoryDef>
  xFormatter?: (tick: number) => string
  yFormatter?: (value: number) => string
  xLabel?: string
  yLabel?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  xLabel: '',
  yLabel: '',
  xFormatter: undefined,
  yFormatter: undefined,
})
</script>

<template>
  <ClientOnly>
    <div class="w-full">
      <AreaChart
        :data="props.data"
        :categories="props.categories"
        :height="props.height"
        :x-formatter="props.xFormatter"
        :y-formatter="props.yFormatter"
        :x-label="props.xLabel"
        :y-label="props.yLabel"
      />
    </div>
    <template #fallback>
      <div
        :style="{ height: `${props.height}px` }"
        class="bg-base-100 flex w-full items-center justify-center"
      >
        <span class="loading loading-spinner loading-lg" />
      </div>
    </template>
  </ClientOnly>
</template>
