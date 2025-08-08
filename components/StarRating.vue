<template>
  <div class="flex items-center gap-1">
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      class="text-2xl focus:outline-none"
      :class="{
        // Active states
        'text-yellow-400': star <= modelValue,
        'text-gray-300': star > modelValue,
        // Interactive states (only when not readonly)
        'cursor-pointer transition-colors duration-150 hover:text-yellow-500':
          !readonly && star <= (hoverRating || modelValue),
        'cursor-pointer transition-colors duration-150 hover:text-yellow-300':
          !readonly && star > (hoverRating || modelValue),
        // Readonly state
        'cursor-default': readonly,
      }"
      :disabled="readonly"
      @click="selectRating(star)"
      @mouseenter="!readonly ? (hoverRating = star) : null"
      @mouseleave="!readonly ? (hoverRating = 0) : null"
    >
      ★
    </button>
    <span v-if="showText && modelValue" class="ml-2 text-sm text-gray-600">
      {{ modelValue }}/5
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  readonly?: boolean
  showText?: boolean
}

interface Emits {
  'update:modelValue': [value: number]
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  showText: false,
})

const emit = defineEmits<Emits>()

const hoverRating = ref(0)

const selectRating = (rating: number) => {
  if (!props.readonly) {
    emit('update:modelValue', rating)
  }
}
</script>
