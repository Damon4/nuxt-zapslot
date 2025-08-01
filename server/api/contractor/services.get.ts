import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

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
  const method = getMethod(event)

  if (method === 'GET') {
    // List contractor's services
    const session = await requireAuth(event)

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.user.id },
    })

    if (!contractor) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Contractor profile required',
      })
    }

    const services = await prisma.service.findMany({
      where: { contractorId: contractor.id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      services: services.map((service) => ({
        ...service,
        bookingsCount: service._count.bookings,
      })),
    }
  }

  if (method === 'POST') {
    // Create new service
    const session = await requireAuth(event)

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.user.id },
    })

    if (!contractor || contractor.status !== 1) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only approved contractors can create services',
      })
    }

    // Check service limit
    const serviceCount = await prisma.service.count({
      where: {
        contractorId: contractor.id,
        isActive: true,
      },
    })

    if (serviceCount >= 20) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum 20 active services allowed per contractor',
      })
    }

    const body = await readBody(event)
    const validatedData = serviceSchema.parse(body)

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        contractorId: contractor.id,
      },
    })

    return { service }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  })
})
