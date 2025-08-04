import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const serviceId = getRouterParam(event, 'id')

  if (!serviceId || isNaN(Number(serviceId))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid service ID',
    })
  }

  const service = await prisma.service.findFirst({
    where: {
      id: Number(serviceId),
      isActive: true,
      contractor: {
        status: 1, // Only approved contractors
      },
    },
    include: {
      contractor: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
  })

  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Service not found',
    })
  }

  return {
    service: {
      ...service,
      bookingsCount: service._count.bookings,
    },
  }
})
