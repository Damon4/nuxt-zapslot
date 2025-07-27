<template>
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="mb-4 text-lg font-bold">Edit Service Provider Profile</h3>

      <form class="space-y-4" @submit.prevent="updateProfile">
        <!-- Service description -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Service Description *</span>
          </label>
          <textarea
            v-model="form.description"
            class="textarea textarea-bordered h-24"
            :class="{ 'textarea-error': errors.description }"
            placeholder="Describe the services you provide..."
            required
          />
          <label v-if="errors.description" class="label">
            <span class="label-text-alt text-error">{{
              errors.description
            }}</span>
          </label>
        </div>

        <!-- Categories -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Service Categories *</span>
          </label>
          <select
            v-model="form.categories"
            class="select select-bordered"
            :class="{ 'select-error': errors.categories }"
            required
          >
            <option disabled value="">Select a category</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <label v-if="errors.categories" class="label">
            <span class="label-text-alt text-error">{{
              errors.categories
            }}</span>
          </label>
        </div>

        <!-- Work experience -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Work Experience</span>
          </label>
          <textarea
            v-model="form.experience"
            class="textarea textarea-bordered h-20"
            placeholder="Tell us about your work experience (optional)"
          />
        </div>

        <!-- Portfolio -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Portfolio</span>
          </label>
          <input
            v-model="form.portfolio"
            type="text"
            class="input input-bordered"
            placeholder="Portfolio link or description (optional)"
          >
        </div>

        <!-- Service pricing -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Service Pricing</span>
          </label>
          <input
            v-model="form.price"
            type="text"
            class="input input-bordered"
            placeholder="e.g. from $50/hour (optional)"
          >
        </div>

        <!-- Buttons -->
        <div class="modal-action">
          <button
            type="button"
            class="btn"
            :disabled="isUpdating"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isUpdating">
            <span
              v-if="isUpdating"
              class="loading loading-spinner loading-sm"
            />
            {{ isUpdating ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Contractor } from '@prisma/client'
import { useNotifications } from '~/composables/useNotifications'

interface ContractorEditForm {
  description: string
  categories: string
  experience: string
  portfolio: string
  price: string
}

interface FormErrors {
  description?: string
  categories?: string
}

// Props
const props = defineProps<{
  contractor: Contractor
}>()

// Emits
const emit = defineEmits<{
  close: []
  success: [contractor: Contractor]
}>()

const { error } = useNotifications()

// Categories list
const categories = [
  'Repair and Construction',
  'Electrical Work',
  'Plumbing',
  'Cleaning Services',
  'Computer Assistance',
  'Design and Interior',
  'Tutoring and Education',
  'Beauty and Health',
  'Auto Services',
  'Courier Services',
  'Photo and Video',
  'Legal Services',
  'Consulting (Business, IT, Finance)',
  'Minor Household Repairs',
  'Event Organization',
  'Web Development and IT',
  'Translation Services',
  'Equipment Repair',
  'Logistics and Transportation',
  'Other',
]

// Reactive state
const isUpdating = ref(false)
const form = ref<ContractorEditForm>({
  description: props.contractor.description || '',
  categories: props.contractor.categories || '',
  experience: props.contractor.experience || '',
  portfolio: props.contractor.portfolio || '',
  price: props.contractor.price || '',
})
const errors = ref<FormErrors>({})

// Validation
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!form.value.description || form.value.description.length < 10) {
    errors.value.description = 'Description must contain at least 10 characters'
    isValid = false
  }

  if (!form.value.categories) {
    errors.value.categories = 'Please select a service category'
    isValid = false
  }

  return isValid
}

// Update profile
const updateProfile = async () => {
  if (!validateForm()) return

  try {
    isUpdating.value = true

    const response = await $fetch<{ data: Contractor }>(
      '/api/contractor/profile',
      {
        method: 'PUT',
        body: {
          description: form.value.description,
          categories: form.value.categories,
          experience: form.value.experience || null,
          portfolio: form.value.portfolio || null,
          price: form.value.price || null,
        },
      }
    )

    emit('success', response.data)
  } catch (err: unknown) {
    console.error('Update error:', err)
    const errorMessage =
      err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message
        : 'Error updating profile'
    error(errorMessage || 'Error updating profile')
  } finally {
    isUpdating.value = false
  }
}
</script>
