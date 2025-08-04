import { computed } from 'vue'

export interface Category {
  id: number
  name: string
  description?: string
}

export interface CategoriesResponse {
  categories: Category[]
}

export const useCategories = () => {
  const { data, pending, error, refresh } = useFetch<CategoriesResponse>(
    '/api/categories',
    {
      key: 'categories',
      default: () => ({ categories: [] }),
      transform: (data: CategoriesResponse) => data,
    }
  )

  const categories = computed(() => data.value?.categories || [])

  const getCategoryById = (id: number): Category | undefined => {
    return categories.value.find((category) => category.id === id)
  }

  const getCategoryByName = (name: string): Category | undefined => {
    return categories.value.find((category) => category.name === name)
  }

  const isLoaded = computed(() => categories.value.length > 0)

  return {
    categories,
    loading: pending,
    error,
    isLoaded,
    refresh,
    getCategoryById,
    getCategoryByName,
  }
}
