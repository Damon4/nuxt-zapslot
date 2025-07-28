<template>
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="mb-6 text-lg font-bold">
        {{ isEditing ? 'Edit Service' : 'Create New Service' }}
      </h3>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Service Title -->
        <div class="form-control">
          <label class="label">
            <span class="label-text"
              >Service Title <span class="text-error">*</span></span
            >
          </label>
          <input
            v-model="formData.title"
            type="text"
            class="input input-bordered"
            :class="{ 'input-error': errors.title }"
            placeholder="Enter service title (10-100 characters)"
            maxlength="100"
          >
          <label v-if="errors.title" class="label">
            <span class="label-text-alt text-error">{{ errors.title }}</span>
          </label>
          <label class="label">
            <span class="label-text-alt"
              >{{ formData.title.length }}/100 characters</span
            >
          </label>
        </div>

        <!-- Service Description -->
        <div class="form-control">
          <label class="label">
            <span class="label-text"
              >Description <span class="text-error">*</span></span
            >
          </label>
          <textarea
            v-model="formData.description"
            class="textarea textarea-bordered h-32"
            :class="{ 'textarea-error': errors.description }"
            placeholder="Describe your service in detail (50-2000 characters)"
            maxlength="2000"
          />
          <label v-if="errors.description" class="label">
            <span class="label-text-alt text-error">{{
              errors.description
            }}</span>
          </label>
          <label class="label">
            <span class="label-text-alt"
              >{{ formData.description.length }}/2000 characters</span
            >
          </label>
        </div>

        <!-- Category -->
        <div class="form-control">
          <label class="label">
            <span class="label-text"
              >Category <span class="text-error">*</span></span
            >
          </label>
          <select
            v-model="formData.category"
            class="select select-bordered"
            :class="{ 'select-error': errors.category }"
          >
            <option value="" disabled>Select a category</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <label v-if="errors.category" class="label">
            <span class="label-text-alt text-error">{{ errors.category }}</span>
          </label>
        </div>

        <!-- Price Type -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Price Type</span>
          </label>
          <div class="join">
            <input
              v-model="formData.priceType"
              class="join-item btn"
              type="radio"
              name="priceType"
              value="FIXED"
              aria-label="Fixed Price"
            >
            <input
              v-model="formData.priceType"
              class="join-item btn"
              type="radio"
              name="priceType"
              value="HOURLY"
              aria-label="Hourly Rate"
            >
            <input
              v-model="formData.priceType"
              class="join-item btn"
              type="radio"
              name="priceType"
              value="NEGOTIABLE"
              aria-label="Negotiable"
            >
          </div>
        </div>

        <!-- Price -->
        <div v-if="formData.priceType !== 'NEGOTIABLE'" class="form-control">
          <label class="label">
            <span class="label-text">
              Price {{ formData.priceType === 'HOURLY' ? 'per Hour' : '' }} ($)
            </span>
          </label>
          <input
            v-model.number="formData.price"
            type="number"
            min="0"
            step="0.01"
            class="input input-bordered"
            :class="{ 'input-error': errors.price }"
            placeholder="Enter price"
          >
          <label v-if="errors.price" class="label">
            <span class="label-text-alt text-error">{{ errors.price }}</span>
          </label>
        </div>

        <!-- Duration -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Duration (minutes)</span>
          </label>
          <input
            v-model.number="formData.duration"
            type="number"
            min="15"
            step="15"
            class="input input-bordered"
            placeholder="Optional - estimated duration"
          >
          <label class="label">
            <span class="label-text-alt"
              >Optional field for time estimates</span
            >
          </label>
        </div>

        <!-- Availability -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Availability</span>
          </label>
          <select
            v-model="formData.availability"
            class="select select-bordered"
          >
            <option value="FLEXIBLE">Flexible</option>
            <option value="WEEKDAYS">Weekdays Only</option>
            <option value="WEEKENDS">Weekends Only</option>
            <option value="MORNINGS">Mornings</option>
            <option value="EVENINGS">Evenings</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span
              v-if="submitting"
              class="loading loading-spinner loading-sm mr-2"
            />
            {{ isEditing ? 'Update Service' : 'Create Service' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServices } from '~/composables/useServices'

// Props and Emits
interface Props {
  service?: {
    id: number
    title: string
    description: string
    category: string
    price?: number
    priceType: 'FIXED' | 'HOURLY' | 'NEGOTIABLE'
    duration?: number
    availability: string
  } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

// Categories from the services plan
const categories = [
  'Household Repair',
  'Cleaning Services',
  'Computer/Internet',
  'Design/Creative',
  'Auto Services',
  'Courier Services',
  'Personal Care',
  'Fitness/Health',
  'Education/Tutoring',
  'Other Services',
]

// Form data
const formData = reactive({
  title: props.service?.title || '',
  description: props.service?.description || '',
  category: props.service?.category || '',
  price: props.service?.price || undefined,
  priceType: props.service?.priceType || 'FIXED',
  duration: props.service?.duration || undefined,
  availability: props.service?.availability || 'FLEXIBLE',
})

// Form state
const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

// Computed
const isEditing = computed(() => !!props.service)

// Composables
const { createService, updateService } = useServices()

// Validation
const validateForm = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  let isValid = true

  // Title validation
  if (!formData.title || formData.title.length < 10) {
    errors.title = 'Title must be at least 10 characters long'
    isValid = false
  } else if (formData.title.length > 100) {
    errors.title = 'Title must not exceed 100 characters'
    isValid = false
  }

  // Description validation
  if (!formData.description || formData.description.length < 50) {
    errors.description = 'Description must be at least 50 characters long'
    isValid = false
  } else if (formData.description.length > 2000) {
    errors.description = 'Description must not exceed 2000 characters'
    isValid = false
  }

  // Category validation
  if (!formData.category) {
    errors.category = 'Please select a category'
    isValid = false
  }

  // Price validation for non-negotiable types
  if (formData.priceType !== 'NEGOTIABLE') {
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Please enter a valid price'
      isValid = false
    }
  }

  return isValid
}

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true

    const serviceData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: formData.priceType === 'NEGOTIABLE' ? undefined : formData.price,
      priceType: formData.priceType,
      duration: formData.duration,
      availability: formData.availability,
    }

    if (isEditing.value && props.service) {
      await updateService(props.service.id, serviceData)
    } else {
      await createService(serviceData)
    }

    emit('saved')
  } catch (error) {
    console.error('Error saving service:', error)
  } finally {
    submitting.value = false
  }
}
</script>
