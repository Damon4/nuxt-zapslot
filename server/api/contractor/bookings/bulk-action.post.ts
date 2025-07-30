import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

const bulkActionSchema = z.object({
  bookingIds: z.array(z.number()).min(1),
  action: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
})

export default defineEventHandler(async (event) => {
  try {
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

    const { bookingIds, action } = bulkActionSchema.parse(body)

    // Verify all bookings belong to this contractor
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        service: {
          contractorId: contractor.id,
        },
      },
    })

    if (bookings.length !== bookingIds.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Some bookings not found or access denied',
      })
    }

    // Validate status transitions for all bookings
    const invalidBookings = bookings.filter((booking) => {
      // Cannot change already cancelled or completed bookings
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
        return true
      }

      // Specific validation based on action
      if (action === 'CONFIRMED' && booking.status !== 'PENDING') {
        return true
      }

      if (action === 'COMPLETED' && booking.status !== 'CONFIRMED') {
        return true
      }

      return false
    })

    if (invalidBookings.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid status transition for ${invalidBookings.length} booking(s)`,
      })
    }

    // Update all bookings
    const updatedBookings = await prisma.booking.updateMany({
      where: {
        id: { in: bookingIds },
        service: {
          contractorId: contractor.id,
        },
      },
      data: {
        status: action,
        updatedAt: new Date(),
      },
    })

    return {
      success: true,
      updatedCount: updatedBookings.count,
      message: `Successfully updated ${updatedBookings.count} booking(s) to ${action}`,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.errors,
      })
    }
    throw error
  }
})
