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

  // Verify booking ownership
  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      clientId: session.user.id,
    },
  })

  if (!booking) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Booking not found',
    })
  }

  if (booking.status !== 'CONFIRMED') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot cancel this booking',
    })
  }

  // Check if booking can be cancelled (at least 2 hours before scheduled time)
  const scheduledTime = new Date(booking.scheduledAt)
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000)

  if (scheduledTime <= twoHoursFromNow) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Cannot cancel booking less than 2 hours before scheduled time',
    })
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: Number(bookingId) },
    data: {
      status: 'CANCELLED',
    },
    include: {
      service: {
        include: {
          contractor: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return { booking: updatedBooking }
})
