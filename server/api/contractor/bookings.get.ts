import { prisma } from '~/lib/prisma'
import { requireAuth } from '~/server/utils/auth'

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
  const status = query.status as string | undefined

  const where = {
    service: {
      contractorId: contractor.id,
    },
    ...(status && { status }),
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
      scheduledAt: 'desc',
    },
  })

  return { bookings }
})
