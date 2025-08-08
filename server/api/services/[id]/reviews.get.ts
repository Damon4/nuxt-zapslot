import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const serviceIdParam = getRouterParam(event, 'id')
  if (!serviceIdParam || isNaN(Number(serviceIdParam))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid service ID' })
  }
  const serviceId = Number(serviceIdParam)

  const query = getQuery(event)
  const page = Number(query.page ?? 1)
  const limit = Math.min(50, Number(query.limit ?? 10))
  const skip = (page - 1) * limit

  // Ensure service exists
  const serviceExists = await prisma.service.findFirst({
    where: { id: serviceId, isActive: true },
    select: { id: true },
  })
  if (!serviceExists) {
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  }

  const [items, total, aggregates] = await Promise.all([
    prisma.review.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        client: { select: { name: true, image: true } },
      },
    }),
    prisma.review.count({ where: { serviceId } }),
    prisma.review.aggregate({
      where: { serviceId },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ])

  return {
    reviews: items,
    total,
    page,
    limit,
    stats: {
      averageRating: aggregates._avg.rating ?? 0,
      reviewsCount: aggregates._count._all,
    },
  }
})
