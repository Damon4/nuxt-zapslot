import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)

    // Find contractor
    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.user.id },
    })

    if (!contractor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Contractor profile not found',
      })
    }

    console.log('Getting blocked times for contractor:', contractor.id)

    // Get all blocked time slots for this contractor
    const blockedTimes = await prisma.timeSlot.findMany({
      where: {
        contractorId: contractor.id,
        isBlocked: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    console.log('Found blocked times:', blockedTimes.length)

    return {
      success: true,
      data: blockedTimes,
    }
  } catch (error) {
    console.error('Error fetching blocked times:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch blocked times',
    })
  }
})
