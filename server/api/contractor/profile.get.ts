import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const user = session.user

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.id },
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
  })

  if (!contractor) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Contractor profile not found',
    })
  }

  return {
    success: true,
    data: contractor,
  }
})
