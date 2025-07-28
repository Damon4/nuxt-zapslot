/**
 * Composable for consistent date formatting across server and client
 * Prevents hydration errors by ensuring consistent output
 */
export const useDateFormat = () => {
  /**
   * Format date consistently on both server and client
   * Uses ISO date format to avoid locale/timezone issues
   */
  const formatDate = (date: string | Date): string => {
    if (!date) return 'N/A'

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
      }

      // Use consistent formatting that works the same on server and client
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')

      return `${day}/${month}/${year}`
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  /**
   * Format time consistently on both server and client
   */
  const formatTime = (date: string | Date): string => {
    if (!date) return 'N/A'

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Time'
      }

      // Use consistent 24-hour format
      const hours = String(dateObj.getHours()).padStart(2, '0')
      const minutes = String(dateObj.getMinutes()).padStart(2, '0')

      return `${hours}:${minutes}`
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Invalid Time'
    }
  }

  /**
   * Format date for display with relative time info
   */
  const formatDateRelative = (date: string | Date): string => {
    if (!date) return 'N/A'

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date

      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
      }

      const now = new Date()
      const diffTime = now.getTime() - dateObj.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return 'Today'
      } else if (diffDays === 1) {
        return 'Yesterday'
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else {
        return formatDate(dateObj)
      }
    } catch (error) {
      console.error('Error formatting relative date:', error)
      return formatDate(date)
    }
  }

  return {
    formatDate,
    formatTime,
    formatDateRelative,
  }
}
