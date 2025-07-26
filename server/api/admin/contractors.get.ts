import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const _session = await requireAuth(event)
  // TODO: Add admin role check
  // if (!_session.user.isAdmin) {
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: 'Admin access required'
  //   })
  // }

  const query = getQuery(event)
  const status = query.status ? parseInt(query.status as string) : undefined
  const page = query.page ? parseInt(query.page as string) : 1
  const limit = query.limit ? parseInt(query.limit as string) : 10

  const skip = (page - 1) * limit

  const [contractors, total] = await Promise.all([
    prisma.contractor.findMany({
      where: status !== undefined ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contractor.count({
      where: status !== undefined ? { status } : undefined,
    }),
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
