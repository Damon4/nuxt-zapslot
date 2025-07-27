import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const serviceId = getRouterParam(event, 'id')

  if (!serviceId || isNaN(Number(serviceId))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid service ID',
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

  // Verify service ownership
  const service = await prisma.service.findFirst({
    where: {
      id: Number(serviceId),
      contractorId: contractor.id,
    },
  })

  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Service not found',
    })
  }

  // Check for active bookings
  const activeBookings = await prisma.booking.count({
    where: {
      serviceId: Number(serviceId),
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
  })

  if (activeBookings > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot delete service with active bookings',
    })
  }

  await prisma.service.delete({
    where: { id: Number(serviceId) },
  })

  return { success: true }
})
