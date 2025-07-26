import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

const moderationSchema = z.object({
  status: z.number().int().min(-1).max(1), // -1: rejected, 0: pending, 1: approved
})

export default defineEventHandler(async (event) => {
  try {
    // CRITICAL: Read request body and params first
    const body = await readBody(event)
    const contractorId = getRouterParam(event, 'id')

    const _session = await requireAuth(event)
    // TODO: Add admin role check
    // if (!_session.user.isAdmin) {
    //   throw createError({
    //     statusCode: 403,
    //     statusMessage: 'Admin access required'
    //   })
    // }

    if (!contractorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Contractor ID is required',
      })
    }

    const { status } = moderationSchema.parse(body)

    const existingContractor = await prisma.contractor.findUnique({
      where: { id: parseInt(contractorId) },
    })

    if (!existingContractor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Contractor not found',
      })
    }

    const contractor = await prisma.contractor.update({
      where: { id: parseInt(contractorId) },
      data: { status },
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

    return {
      success: true,
      data: contractor,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.errors,
      })
    }
    throw error
  }
})
