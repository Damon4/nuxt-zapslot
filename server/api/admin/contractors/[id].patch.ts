import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAdmin } from '~/server/utils/auth'

const prisma = new PrismaClient()

const contractorManagementSchema = z.object({
  status: z.number().int().min(1).max(3), // 1: approved, 3: suspended (no pending/rejected)
})

export default defineEventHandler(async (event) => {
  try {
    // CRITICAL: Read request body and params first
    const body = await readBody(event)
    const contractorId = getRouterParam(event, 'id')

    await requireAdmin(event)

    if (!contractorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Contractor ID is required',
      })
    }

    const { status } = contractorManagementSchema.parse(body)

    const existingContractor = await prisma.contractor.findUnique({
      where: { id: parseInt(contractorId) },
    })

    if (!existingContractor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Contractor not found',
      })
    }

    // Only allow changing between approved (1) and suspended (3)
    if (![1, 3].includes(status)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Invalid status. Only approved (1) and suspended (3) are allowed.',
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
