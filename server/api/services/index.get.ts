import { prisma } from '~/lib/prisma'
import type { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const search = query.search as string
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
  const sort = (query.sort as string) || 'newest'

  const skip = (page - 1) * limit

  // Build where clause
  const where: Prisma.ServiceWhereInput = {
    isActive: true,
    contractor: {
      status: 1, // Only active contractors
    },
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (maxPrice) {
    where.price = { lte: maxPrice }
  }

  // Build orderBy clause
  let orderBy: Prisma.ServiceOrderByWithRelationInput = {}
  switch (sort) {
    case 'price-low':
      orderBy = { price: 'asc' }
      break
    case 'alphabetical':
      orderBy = { title: 'asc' }
      break
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' }
      break
  }

  try {
    // Get services with booking counts
    const services = await prisma.service.findMany({
      where,
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await prisma.service.count({ where })

    // Transform data
    const transformedServices = services.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category || 'Other',
      price: service.price,
      priceType: service.priceType,
      duration: service.duration,
      availability: service.availability,
      contractor: {
        user: {
          name: service.contractor.user.name,
          image: service.contractor.user.image,
        },
      },
      bookingsCount: service._count.bookings,
    }))

    return {
      services: transformedServices,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error) {
    console.error('Error fetching services:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch services',
    })
  }
})
