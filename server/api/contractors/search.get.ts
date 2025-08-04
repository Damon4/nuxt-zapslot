import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = (query.search as string) || ''
  const category = (query.category as string) || ''
  const page = query.page ? parseInt(query.page as string) : 1
  const limit = query.limit ? parseInt(query.limit as string) : 10

  const skip = (page - 1) * limit

  const where = {
    status: 1, // only approved contractors
    ...(search && {
      OR: [
        { description: { contains: search, mode: 'insensitive' as const } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
    ...(category && {
      categories: { contains: category, mode: 'insensitive' as const },
    }),
  }

  const [contractors, total] = await Promise.all([
    prisma.contractor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contractor.count({ where }),
  ])

  return {
    success: true,
    data: {
      contractors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  }
})
