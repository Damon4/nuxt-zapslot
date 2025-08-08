import { z } from 'zod'
import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/lib/prisma'

const contractorApplicationSchema = z.object({
  description: z.string().min(10).max(1000),
  categories: z.string().min(1),
  experience: z.string().optional(),
  portfolio: z.string().optional(),
  price: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // CRITICAL: Operation order is crucial in Nuxt 4!
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
        statusMessage: 'Active contractor application already exists',
      })
    }

    const validatedData = contractorApplicationSchema.parse(body)

    const now = new Date()

    // Create new contractor (no need to handle status 0 as profiles are deleted completely)
    const contractor = await prisma.contractor.create({
      data: {
        userId: user.id,
        description: validatedData.description,
        categories: validatedData.categories,
        experience: validatedData.experience,
        portfolio: validatedData.portfolio,
        price: validatedData.price,
        status: 1, // automatically approved
        appliedAt: now,
        approvedAt: now, // approved immediately
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
