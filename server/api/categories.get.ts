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

    return {
      categories,
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
