import { z } from 'zod'
import { prisma } from '~/lib/prisma'
import { requireAuth } from '~/server/utils/auth'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // Read body first (critical project rule)
    const body = await readBody(event)
    const session = await requireAuth(event)

    const serviceIdParam = getRouterParam(event, 'id')
    if (!serviceIdParam || isNaN(Number(serviceIdParam))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid service ID',
      })
    }
    const serviceId = Number(serviceIdParam)

    const { rating, comment } = reviewSchema.parse(body)

    // Ensure service exists and is active
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        isActive: true,
        contractor: { status: 1 },
      },
      select: { id: true },
    })
    if (!service) {
      throw createError({ statusCode: 404, statusMessage: 'Service not found' })
    }

    // Ensure user had a COMPLETED booking for this service
    const completedBooking = await prisma.booking.findFirst({
      where: {
        serviceId,
        clientId: session.user.id,
        status: 'COMPLETED',
      },
      select: { id: true },
    })
    if (!completedBooking) {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Only clients with completed bookings can leave a review',
      })
    }

    // Create or update review (idempotent per service/client)
    const review = await prisma.review.upsert({
      where: { serviceId_clientId: { serviceId, clientId: session.user.id } },
      create: {
        serviceId,
        clientId: session.user.id,
        rating,
        comment,
      },
      update: { rating, comment },
    })

    return { review }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.errors,
      })
    }
    throw error
  }
})
