import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (_event) => {
  try {
    // Get all active categories
    const categories = await prisma.contractorCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    // Get service counts for all categories in one query
    const serviceCounts = await prisma.service.groupBy({
      by: ['category'],
      where: {
        isActive: true,
        contractor: {
          status: 1, // Only active contractors
        },
      },
      _count: {
        id: true,
      },
    })

    // Create a map for quick lookup
    const serviceCountMap = new Map(
      serviceCounts.map((item) => [item.category, item._count.id])
    )

    // Combine categories with their service counts
    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      serviceCount: serviceCountMap.get(category.name) || 0,
    }))

    return {
      categories: categoriesWithCounts,
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
