import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.user.id },
    })

    if (!contractor) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Contractor profile required',
      })
    }

    const query = getQuery(event)
    const startDate = query.start as string | undefined
    const endDate = query.end as string | undefined

    if (!startDate || !endDate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Start and end dates are required',
      })
    }

    // Get contractor availability
    const availability = await prisma.contractorAvailability.findMany({
      where: {
        contractorId: contractor.id,
        isAvailable: true,
      },
      orderBy: { dayOfWeek: 'asc' },
    })

    // Get existing bookings in the date range
    const bookings = await prisma.booking.findMany({
      where: {
        service: {
          contractorId: contractor.id,
        },
        scheduledAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
    })

    // Get blocked time slots in the date range
    const blockedSlots = await prisma.timeSlot.findMany({
      where: {
        contractorId: contractor.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        isBlocked: true,
      },
    })

    // Calculate available slots
    const slots = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay()
      const dayAvailability = availability.find(
        (a) => a.dayOfWeek === dayOfWeek
      )

      if (!dayAvailability) continue

      // Check for blocked slots on this date
      const dayBlockedSlots = blockedSlots.filter(
        (slot) => slot.date.toDateString() === date.toDateString()
      )

      // Check for bookings on this date
      const dayBookings = bookings.filter(
        (booking) => booking.scheduledAt.toDateString() === date.toDateString()
      )

      // Generate available time slots (simplified - 1 hour slots)
      const startHour = parseInt(dayAvailability.startTime.split(':')[0])
      const endHour = parseInt(dayAvailability.endTime.split(':')[0])

      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`
        const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`
        const slotDateTime = new Date(date)
        slotDateTime.setHours(hour, 0, 0, 0)

        // Check if slot is blocked
        const isBlocked = dayBlockedSlots.some(
          (blocked) =>
            slotStart >= blocked.startTime && slotStart < blocked.endTime
        )

        // Check if slot is booked
        const isBooked = dayBookings.some((booking) => {
          const bookingHour = booking.scheduledAt.getHours()
          return bookingHour === hour
        })

        if (!isBlocked && !isBooked) {
          slots.push({
            date: date.toISOString().split('T')[0],
            startTime: slotStart,
            endTime: slotEnd,
            available: true,
          })
        }
      }
    }

    return {
      success: true,
      slots,
      availability,
      bookings: bookings.length,
      blockedSlots: blockedSlots.length,
    }
  } catch (error) {
    console.error('Error fetching available slots:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch available slots',
    })
  }
})
