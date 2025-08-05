import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated session
    const session = await requireAuth(event)

    // Find contractor
    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.user.id },
    })

    if (!contractor) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only contractors can view blocked slots',
      })
    }

    // Get current date to filter out past blocked slots
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Start of today

    // Fetch blocked time slots for this contractor
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        contractorId: contractor.id,
        isBlocked: true,
        date: {
          gte: today, // Only future and today's blocked slots
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    return {
      timeSlots: timeSlots.map((slot) => ({
        id: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: slot.reason || undefined,
      })),
    }
  } catch (error: unknown) {
    console.error('Error fetching blocked slots:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
