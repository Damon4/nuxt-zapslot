<template>
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="mb-4 text-lg font-bold">Apply for Service Provider Status</h3>

      <form class="space-y-4" @submit.prevent="submitApplication">
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

        <!-- Terms agreement -->
        <div class="form-control">
          <label class="label cursor-pointer justify-start">
            <input
              v-model="form.agreeToTerms"
              type="checkbox"
              class="checkbox checkbox-primary mr-3"
              required
            >
            <span class="label-text">
              I agree to the service provider terms *
            </span>
          </label>
        </div>

        <!-- Buttons -->
        <div class="modal-action">
          <button
            type="button"
            class="btn"
            :disabled="isSubmitting"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !form.agreeToTerms"
          >
            <span
              v-if="isSubmitting"
              class="loading loading-spinner loading-sm"
            />
            {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '~/composables/useNotifications'

interface ContractorForm {
  description: string
  categories: string
  experience: string
  portfolio: string
  price: string
  agreeToTerms: boolean
}

interface FormErrors {
  description?: string
  categories?: string
}

interface ContractorResponse {
  data: {
    id: number
    description: string
    categories: string
    experience: string | null
    portfolio: string | null
    price: string | null
    status: number
    userId: number
    createdAt: Date
    updatedAt: Date
  }
}

// Emits
const emit = defineEmits<{
  close: []
  success: [contractor: ContractorResponse['data']]
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
const isSubmitting = ref(false)
const form = ref<ContractorForm>({
  description: '',
  categories: '',
  experience: '',
  portfolio: '',
  price: '',
  agreeToTerms: false,
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

// Submit form
const submitApplication = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const response = await $fetch<ContractorResponse>('/api/contractor/apply', {
      method: 'POST',
      body: {
        description: form.value.description,
        categories: form.value.categories,
        experience: form.value.experience || undefined,
        portfolio: form.value.portfolio || undefined,
        price: form.value.price || undefined,
      },
    })

    emit('success', response.data)
  } catch (err: unknown) {
    console.error('Application error:', err)
    const errorMessage =
      err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message
        : 'Error submitting application'
    error(errorMessage || 'Error submitting application')
  } finally {
    isSubmitting.value = false
  }
}
</script>
