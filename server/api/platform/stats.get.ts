import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (_event) => {
  try {
    // Get platform statistics
    const [contractorsCount, servicesCount, bookingsCount, categoriesCount] =
      await Promise.all([
        prisma.contractor.count({
          where: { status: 1 }, // Active contractors
        }),
        prisma.service.count(),
        prisma.booking.count({
          where: { status: 'CONFIRMED' },
        }),
        prisma.contractorCategory.count(),
      ])

    return {
      contractors: contractorsCount,
      services: servicesCount,
      bookings: bookingsCount,
      categories: categoriesCount,
    }
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch platform statistics',
    })
  }
})
