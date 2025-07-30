import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
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

  const query = getQuery(event)
  const startDate = query.start as string | undefined
  const endDate = query.end as string | undefined
  const status = query.status as string | undefined

  const where = {
    service: {
      contractorId: contractor.id,
    },
    ...(status && { status }),
    ...(startDate &&
      endDate && {
        scheduledAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: {
        select: {
          title: true,
          category: true,
          price: true,
          priceType: true,
          duration: true,
        },
      },
      client: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })

  return { bookings }
})
