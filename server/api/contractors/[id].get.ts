import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const contractorId = getRouterParam(event, 'id')

  if (!contractorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Contractor ID is required',
    })
  }

  const contractor = await prisma.contractor.findUnique({
    where: {
      id: parseInt(contractorId),
      status: 1, // only approved contractors
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
        },
      },
    },
  })

  if (!contractor) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Contractor not found',
    })
  }

  return {
    success: true,
    data: contractor,
  }
})
