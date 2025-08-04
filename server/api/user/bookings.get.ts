import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const bookings = await prisma.booking.findMany({
    where: {
      clientId: session.user.id,
    },
    include: {
      service: {
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
        },
      },
    },
    orderBy: {
      scheduledAt: 'desc',
    },
  })

  return { bookings }
})
