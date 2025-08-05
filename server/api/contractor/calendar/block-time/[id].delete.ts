import { z } from 'zod'
import { prisma } from '~/lib/prisma'

import { requireAuth } from '~/server/utils/auth'

// Schema for validating the slot ID parameter
const deleteSlotSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Invalid slot ID',
    }),
})

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const session = await requireAuth(event)

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.user.id },
    })

    if (!contractor) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only contractors can manage time slots',
      })
    }

    // Get and validate slot ID from route params
    const slotId = getRouterParam(event, 'id')
    const { id } = deleteSlotSchema.parse({ id: slotId })

    // Check if the time slot exists and belongs to this contractor
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        id,
        contractorId: contractor.id,
        isBlocked: true,
      },
    })

    if (!timeSlot) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Blocked time slot not found',
      })
    }

    // Check if the time slot is in the past
    const slotDateTime = new Date(`${timeSlot.date}T${timeSlot.startTime}:00`)
    const now = new Date()

    if (slotDateTime < now) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot unblock time slots in the past',
      })
    }

    // Delete the blocked time slot
    await prisma.timeSlot.delete({
      where: { id },
    })

    return {
      success: true,
      message: 'Time slot unblocked successfully',
    }
  } catch (error: unknown) {
    console.error('Error unblocking time slot:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
