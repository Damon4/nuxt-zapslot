import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for rescheduling
const rescheduleSchema = z.object({
  newScheduledAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
})

export default defineEventHandler(async (event) => {
  try {
    // Read request body first (critical pattern)
    const body = await readBody(event)

    // Then check authorization
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

    // Get booking ID from route params
    const bookingId = getRouterParam(event, 'id')
    if (!bookingId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Booking ID is required',
      })
    }

    // Validate the reschedule data
    const { newScheduledAt } = rescheduleSchema.parse(body)
    const newDate = new Date(newScheduledAt)
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    // Validate new booking time
    if (newDate < twoHoursFromNow) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New booking time must be at least 2 hours in advance',
      })
    }

    // Find the booking and verify ownership
    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(bookingId),
        service: {
          contractorId: contractor.id,
        },
      },
      include: {
        service: {
          select: {
            title: true,
            contractorId: true,
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!booking) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Booking not found or not owned by contractor',
      })
    }

    // Check if booking can be rescheduled
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot reschedule completed or cancelled bookings',
      })
    }

    // Check for conflicts with existing bookings at the new time
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        service: {
          contractorId: contractor.id,
        },
        scheduledAt: newDate,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        id: {
          not: booking.id, // Exclude current booking
        },
      },
    })

    if (conflictingBooking) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New time slot conflicts with existing booking',
      })
    }

    // Check for blocked time slots
    const timeString = newDate.toTimeString().slice(0, 5) // HH:mm format

    const blockedSlot = await prisma.timeSlot.findFirst({
      where: {
        contractorId: contractor.id,
        date: {
          equals: new Date(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate()
          ),
        },
        isBlocked: true,
        startTime: {
          lte: timeString,
        },
        endTime: {
          gt: timeString,
        },
      },
    })

    if (blockedSlot) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New time slot is blocked',
      })
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        scheduledAt: newDate,
        // Optionally reset status to PENDING for contractor confirmation
        // status: 'PENDING',
      },
      include: {
        service: {
          select: {
            title: true,
            category: true,
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return {
      success: true,
      message: 'Booking rescheduled successfully',
      booking: updatedBooking,
      previousTime: booking.scheduledAt,
      newTime: newDate,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid reschedule data',
        data: error.errors,
      })
    }

    console.error('Error rescheduling booking:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reschedule booking',
    })
  }
})
