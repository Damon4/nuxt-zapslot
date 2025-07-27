import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

const contractorApplicationSchema = z.object({
  description: z.string().min(10).max(1000),
  categories: z.string().min(1),
  experience: z.string().optional(),
  portfolio: z.string().optional(),
  price: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // CRITICAL: Operation order is crucial in Nuxt 3!
    // readBody() must be called before requireAuth() as requireAuth()
    // may modify the event object state making the request body unavailable
    const body = await readBody(event)

    const session = await requireAuth(event)
    const user = session.user

    const existingContractor = await prisma.contractor.findUnique({
      where: { userId: user.id },
    })

    if (existingContractor) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Contractor application already exists',
      })
    }

    const validatedData = contractorApplicationSchema.parse(body)

    const contractor = await prisma.contractor.create({
      data: {
        userId: user.id,
        description: validatedData.description,
        categories: validatedData.categories,
        experience: validatedData.experience,
        portfolio: validatedData.portfolio,
        price: validatedData.price,
        status: 0, // pending
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
