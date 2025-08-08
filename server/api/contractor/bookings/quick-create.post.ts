import { requireAuth } from '~/server/utils/auth'
import { z } from 'zod'
import { prisma } from '~/lib/prisma'

// Validation schema for quick booking creation
const quickBookingSchema = z.object({
  serviceId: z.number().positive(),
  clientEmail: z.string().email(),
  scheduledAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  duration: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // Required order: readBody() → auth check (Nuxt 4)
    const body = await readBody(event)
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

    // Validate the booking data
    const { serviceId, clientEmail, scheduledAt, duration, notes } =
      quickBookingSchema.parse(body)

    // Verify the service belongs to this contractor
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        contractorId: contractor.id,
        isActive: true,
      },
    })

    if (!service) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Service not found or not owned by contractor',
      })
    }

    // Find or create the client user
    let client = await prisma.user.findUnique({
      where: { email: clientEmail },
    })

    if (!client) {
      // For quick booking, we'll create a basic user profile
      // In a real app, you might want to send an invitation email instead
      client = await prisma.user.create({
        data: {
          id: `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: clientEmail,
          name: clientEmail.split('@')[0], // Use email prefix as name
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }

    const scheduledDate = new Date(scheduledAt)
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    // Validate booking time
    if (scheduledDate < twoHoursFromNow) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Booking must be at least 2 hours in advance',
      })
    }

    // Check for conflicts with existing bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        service: {
          contractorId: contractor.id,
        },
        scheduledAt: scheduledDate,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    })

    if (conflictingBooking) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Time slot is already booked',
      })
    }

    // Check for blocked time slots
    const timeString = scheduledDate.toTimeString().slice(0, 5) // HH:mm format
    const blockedSlot = await prisma.timeSlot.findFirst({
      where: {
        contractorId: contractor.id,
        date: {
          equals: new Date(
            scheduledDate.getFullYear(),
            scheduledDate.getMonth(),
            scheduledDate.getDate()
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
        statusMessage: 'Time slot is blocked',
      })
    }

    // Calculate total price (simplified - use service price)
    const totalPrice = service.price || null

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        serviceId: service.id,
        clientId: client.id,
        scheduledAt: scheduledDate,
        duration: duration || service.duration,
        totalPrice,
        notes,
        status: 'CONFIRMED', // Quick bookings are auto-confirmed
      },
      include: {
        service: {
          select: {
            title: true,
            category: true,
            price: true,
            priceType: true,
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
      message: 'Quick booking created successfully',
      booking,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid booking data',
        data: error.errors,
      })
    }

    console.error('Error creating quick booking:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create quick booking',
    })
  }
})
