import { z } from 'zod'
import { prisma } from '~/lib/prisma'

import { requireAuth } from '~/server/utils/auth'

const serviceSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),
  category: z.enum([
    'Household Repair',
    'Cleaning Services',
    'Computer/Internet',
    'Design/Creative',
    'Auto Services',
    'Courier Services',
    'Personal Care',
    'Fitness/Health',
    'Education/Tutoring',
    'Other Services',
  ]),
  price: z.number().positive().optional(),
  priceType: z.enum(['FIXED', 'HOURLY', 'NEGOTIABLE']).default('FIXED'),
  duration: z.number().positive().optional(),
  availability: z
    .enum(['WEEKDAYS', 'WEEKENDS', 'MORNINGS', 'EVENINGS', 'FLEXIBLE'])
    .default('FLEXIBLE'),
})

export default defineEventHandler(async (event) => {
  try {
    // ✅ CRITICAL: Read request body first
    const body = await readBody(event)

    // ✅ CORRECT: Then check authorization
    const session = await requireAuth(event)
    const serviceId = getRouterParam(event, 'id')

    if (!serviceId || isNaN(Number(serviceId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid service ID',
      })
    }

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.user.id },
    })

    if (!contractor) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Contractor profile required',
      })
    }

    // Verify service ownership
    const service = await prisma.service.findFirst({
      where: {
        id: Number(serviceId),
        contractorId: contractor.id,
      },
    })

    if (!service) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Service not found',
      })
    }

    const validatedData = serviceSchema.parse(body)

    const updatedService = await prisma.service.update({
      where: { id: Number(serviceId) },
      data: validatedData,
    })

    return { service: updatedService }
  } catch (error) {
    // Handle Zod validation errors according to guidelines
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
