import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const bookingId = getRouterParam(event, 'id')

  if (!bookingId || isNaN(Number(bookingId))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid booking ID',
    })
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
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
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!booking) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Booking not found or access denied',
    })
  }

  return { booking }
})
