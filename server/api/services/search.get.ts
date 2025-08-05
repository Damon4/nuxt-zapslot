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
  sortBy: z.enum(['price', 'createdAt', 'title']).default('createdAt'),
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
        _count: {
          select: { bookings: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.service.count({ where }),
  ])

  return {
    services: services.map((service) => ({
      ...service,
      bookingsCount: service._count.bookings,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
})
