import { z } from 'zod'
import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/lib/prisma'

const contractorUpdateSchema = z.object({
  description: z.string().min(10).max(1000).optional(),
  categories: z.string().min(1).optional(),
  experience: z.string().optional(),
  portfolio: z.string().optional(),
  price: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // Required order: readBody() → auth check (Nuxt 4)
    const body = await readBody(event)
    const session = await requireAuth(event)
    const user = session.user

    const existingContractor = await prisma.contractor.findUnique({
      where: { userId: user.id },
    })

    if (!existingContractor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Contractor profile not found',
      })
    }

    // Validate data
    const validatedData = contractorUpdateSchema.parse(body)

    // Update contractor profile
    const contractor = await prisma.contractor.update({
      where: { userId: user.id },
      data: validatedData,
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
