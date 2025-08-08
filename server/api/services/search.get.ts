import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '~/lib/prisma'

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  priceFrom: z.number().optional(),
  priceTo: z.number().optional(),
  availability: z.string().optional(),
  contractorId: z.number().optional(),
  minRating: z.number().min(1).max(5).optional(),
  sortBy: z
    .enum(['price', 'createdAt', 'title', 'rating'])
    .default('createdAt'),
  page: z.number().default(1),
  limit: z.number().max(50).default(20),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const validatedQuery = searchSchema.parse({
    ...query,
    priceFrom: query.priceFrom ? Number(query.priceFrom) : undefined,
    priceTo: query.priceTo ? Number(query.priceTo) : undefined,
    contractorId: query.contractorId ? Number(query.contractorId) : undefined,
    minRating: query.minRating ? Number(query.minRating) : undefined,
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 20,
  })

  const {
    q,
    category,
    priceFrom,
    priceTo,
    availability,
    contractorId,
    minRating,
    sortBy,
    page,
    limit,
  } = validatedQuery
  const skip = (page - 1) * limit

  // Build where clause
  const where: Prisma.ServiceWhereInput = {
    isActive: true,
    contractor: {
      status: 1, // Only approved contractors
    },
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.category = category
  }

  if (priceFrom !== undefined || priceTo !== undefined) {
    where.price = {}
    if (priceFrom !== undefined) where.price.gte = priceFrom
    if (priceTo !== undefined) where.price.lte = priceTo
  }

  if (availability) {
    where.availability = availability
  }

  if (contractorId) {
    where.contractorId = contractorId
  }

  // Build order by
  let orderBy: Prisma.ServiceOrderByWithRelationInput = { createdAt: 'desc' }
  if (sortBy === 'price') {
    orderBy = { price: 'asc' }
  } else if (sortBy === 'title') {
    orderBy = { title: 'asc' }
  } else if (sortBy === 'rating') {
    // We'll sort by average rating in the response processing
    orderBy = { createdAt: 'desc' }
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
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
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.service.count({ where }),
  ])

  // Process services to add rating information
  let processedServices = services.map((service) => {
    const ratings = service.reviews.map((r) => r.rating)
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0
    const reviewCount = service._count.reviews

    return {
      ...service,
      bookingsCount: service._count.bookings,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount,
      reviews: undefined, // Remove reviews from response for cleaner data
    }
  })

  // Filter by minimum rating if specified
  if (minRating !== undefined) {
    processedServices = processedServices.filter(
      (service) => service.averageRating >= minRating
    )
  }

  // Sort by rating if requested
  if (sortBy === 'rating') {
    processedServices.sort((a, b) => b.averageRating - a.averageRating)
  }

  // Recalculate pagination if we filtered by rating
  const filteredTotal =
    minRating !== undefined ? processedServices.length : total

  return {
    services: processedServices,
    pagination: {
      page,
      limit,
      total: filteredTotal,
      pages: Math.ceil(filteredTotal / limit),
    },
  }
})
