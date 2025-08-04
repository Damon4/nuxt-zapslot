import { z } from 'zod'
import { prisma } from '~/lib/prisma'

import { requireAuth } from '~/server/utils/auth'

const bookingSchema = z.object({
  scheduledAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // ✅ CRITICAL: Read request body first
    const body = await readBody(event)

    // ✅ CORRECT: Then check authorization
    const session = await requireAuth(event)
    const serviceId = getRouterParam(event, 'id')

    if (!serviceId || isNaN(Number(serviceId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid service ID',
      })
    }

    // Check if service exists and is active
    const service = await prisma.service.findFirst({
      where: {
        id: Number(serviceId),
        isActive: true,
        contractor: {
          status: 1, // Only approved contractors
        },
      },
      include: {
        contractor: true,
      },
    })

    if (!service) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Service not found or not available',
      })
    }

    // Prevent self-booking
    if (service.contractor.userId === session.user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot book your own service',
      })
    }

    const { scheduledAt, notes } = bookingSchema.parse(body)

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

    // Check user's active bookings limit (only confirmed bookings count)
    const activeBookingsCount = await prisma.booking.count({
      where: {
        clientId: session.user.id,
        status: 'CONFIRMED',
      },
    })

    if (activeBookingsCount >= 10) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum 10 active bookings allowed per user',
      })
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: Number(serviceId),
        clientId: session.user.id,
        scheduledAt: scheduledDate,
        duration: service.duration,
        totalPrice: service.price,
        status: 'CONFIRMED', // Create bookings as confirmed immediately
        notes,
      },
      include: {
        service: {
          include: {
            contractor: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return { booking }
  } catch (error) {
    // Handle Zod validation errors according to guidelines
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.errors,
      })
    }
    throw error
  }
})
