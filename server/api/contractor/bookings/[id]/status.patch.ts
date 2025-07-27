import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

const statusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
})

export default defineEventHandler(async (event) => {
  try {
    // ✅ CRITICAL: Read request body first
    const body = await readBody(event)

    // ✅ CORRECT: Then check authorization
    const session = await requireAuth(event)
    const bookingId = getRouterParam(event, 'id')

    if (!bookingId || isNaN(Number(bookingId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid booking ID',
      })
    }

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.user.id },
    })

    if (!contractor) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Contractor profile required',
      })
    }

    // Verify booking ownership
    const booking = await prisma.booking.findFirst({
      where: {
        id: Number(bookingId),
        service: {
          contractorId: contractor.id,
        },
      },
    })

    if (!booking) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Booking not found',
      })
    }

    const { status } = statusSchema.parse(body)

    // Validate status transition
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot change status of cancelled or completed booking',
      })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status },
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

    return { booking: updatedBooking }
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
