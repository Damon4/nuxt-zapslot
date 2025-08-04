import { prisma } from '~/lib/prisma'
import {
  addDays,
  format,
  startOfDay,
  isAfter,
  isBefore,
  setHours,
  setMinutes,
} from 'date-fns'

interface AvailableSlot {
  date: string
  time: string
  datetime: string
}

export default defineEventHandler(async (event) => {
  const serviceId = getRouterParam(event, 'id')

  if (!serviceId || isNaN(Number(serviceId))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid service ID',
    })
  }

  // Get service with contractor info
  const service = await prisma.service.findFirst({
    where: {
      id: Number(serviceId),
      isActive: true,
      contractor: {
        status: 1, // Only approved contractors
      },
    },
    include: {
      contractor: {
        include: {
          contractorAvailability: true,
        },
      },
    },
  })

  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Service not found',
    })
  }

  const contractorId = service.contractor.id
  const serviceDuration = service.duration || 60 // Default 60 minutes if not specified

  // Get availability for the next 14 days
  const today = startOfDay(new Date())
  const endDate = addDays(today, 14)

  // Get contractor's weekly availability
  const availability = service.contractor.contractorAvailability

  // Create robust availability that always covers all 7 days
  let effectiveAvailability: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isAvailable: boolean
  }> = []

  if (availability && availability.length > 0) {
    // If contractor has some availability, extend it to all days
    const template = availability.find((a) => a.isAvailable) || availability[0]

    if (template) {
      // Create availability for all 7 days using the template
      effectiveAvailability = [1, 2, 3, 4, 5, 6, 7].map((day) => {
        const existingDay = availability.find(
          (a) => a.dayOfWeek === day && a.isAvailable
        )
        return (
          existingDay || {
            dayOfWeek: day,
            startTime: template.startTime,
            endTime: template.endTime,
            isAvailable: true,
          }
        )
      })
    } else {
      // Fallback to default if no available days
      effectiveAvailability = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      }))
    }
  } else {
    // No availability data, create default business hours (Monday-Friday, 9 AM - 5 PM)
    effectiveAvailability = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: day >= 1 && day <= 5, // Only weekdays by default
    }))
  }

  // Get existing bookings for the contractor in the date range
  const existingBookings = await prisma.booking.findMany({
    where: {
      service: {
        contractorId: contractorId,
      },
      scheduledAt: {
        gte: today,
        lte: endDate,
      },
      status: {
        in: ['CONFIRMED'], // Only check confirmed bookings since we no longer use PENDING
      },
    },
    select: {
      scheduledAt: true,
      duration: true,
    },
  })

  // Get blocked time slots
  const blockedSlots = await prisma.timeSlot.findMany({
    where: {
      contractorId: contractorId,
      date: {
        gte: today,
        lte: endDate,
      },
      isBlocked: true,
    },
    select: {
      date: true,
      startTime: true,
      endTime: true,
    },
  })

  const availableSlots: AvailableSlot[] = []

  // Generate available slots for each day
  for (let days = 0; days < 14; days++) {
    const currentDate = addDays(today, days)
    const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay() // Convert Sunday from 0 to 7

    // Find availability for this day of week
    const dayAvailability = effectiveAvailability.find(
      (a) => a.dayOfWeek === dayOfWeek && a.isAvailable
    )

    if (!dayAvailability) {
      continue
    }

    // Parse start and end times
    const [startHour, startMinute] = dayAvailability.startTime
      .split(':')
      .map(Number)
    const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number)

    const dayStart = setMinutes(setHours(currentDate, startHour), startMinute)
    const dayEnd = setMinutes(setHours(currentDate, endHour), endMinute)

    // Generate 30-minute time slots
    let slotTime = dayStart
    // Ensure we don't generate slots that would end after working hours
    const lastPossibleSlotStart = addMinutes(dayEnd, -serviceDuration)

    while (slotTime.getTime() <= lastPossibleSlotStart.getTime()) {
      // Skip if slot is in the past (for today)
      if (days === 0 && isBefore(slotTime, new Date())) {
        slotTime = addMinutes(slotTime, 30)
        continue
      }

      // For multi-slot services, check that all required slots are available
      let isSlotGroupAvailable = true
      const slotsNeeded = Math.ceil(serviceDuration / 30) // How many 30-min slots we need

      for (let i = 0; i < slotsNeeded; i++) {
        const checkSlotStart = addMinutes(slotTime, i * 30)
        const checkSlotEnd = addMinutes(checkSlotStart, 30)

        // Check if this sub-slot conflicts with existing bookings
        const hasBookingConflict = existingBookings.some((booking) => {
          const bookingStart = new Date(booking.scheduledAt)
          const bookingEnd = addMinutes(bookingStart, booking.duration || 60)

          return (
            (isAfter(checkSlotStart, bookingStart) &&
              isBefore(checkSlotStart, bookingEnd)) ||
            (isAfter(checkSlotEnd, bookingStart) &&
              isBefore(checkSlotEnd, bookingEnd)) ||
            (isBefore(checkSlotStart, bookingStart) &&
              isAfter(checkSlotEnd, bookingEnd))
          )
        })

        // Check if this sub-slot conflicts with blocked time
        const hasBlockedConflict = blockedSlots.some((blocked) => {
          const blockedDate = format(new Date(blocked.date), 'yyyy-MM-dd')
          const currentDateStr = format(currentDate, 'yyyy-MM-dd')

          if (blockedDate !== currentDateStr) return false

          const [blockedStartHour, blockedStartMinute] = blocked.startTime
            .split(':')
            .map(Number)
          const [blockedEndHour, blockedEndMinute] = blocked.endTime
            .split(':')
            .map(Number)

          const blockedStart = setMinutes(
            setHours(currentDate, blockedStartHour),
            blockedStartMinute
          )
          const blockedEnd = setMinutes(
            setHours(currentDate, blockedEndHour),
            blockedEndMinute
          )

          return (
            (isAfter(checkSlotStart, blockedStart) &&
              isBefore(checkSlotStart, blockedEnd)) ||
            (isAfter(checkSlotEnd, blockedStart) &&
              isBefore(checkSlotEnd, blockedEnd)) ||
            (isBefore(checkSlotStart, blockedStart) &&
              isAfter(checkSlotEnd, blockedEnd))
          )
        })

        if (hasBookingConflict || hasBlockedConflict) {
          isSlotGroupAvailable = false
          break
        }
      }

      if (isSlotGroupAvailable) {
        availableSlots.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          time: format(slotTime, 'HH:mm'),
          datetime: slotTime.toISOString(),
        })
      }

      slotTime = addMinutes(slotTime, 30) // Move to next 30-minute slot
    }
  }

  return {
    availableSlots: availableSlots.slice(0, 200), // Limit to first 200 slots
    nextAvailableSlot: availableSlots[0] || null,
  }
})

// Helper function to add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}
