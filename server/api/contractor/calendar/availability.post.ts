import { requireAuth } from '~/server/utils/auth'
import { z } from 'zod'
import { prisma } from '~/lib/prisma'

// Validation schema for availability setting
const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  isAvailable: z.boolean(),
})

const availabilityArraySchema = z.array(availabilitySchema)

export default defineEventHandler(async (event) => {
  try {
    // Read request body first (critical pattern)
    const body = await readBody(event)

    // Then check authorization
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

    // Validate the availability data
    const availabilityData = availabilityArraySchema.parse(body.availability)

    // Delete existing availability for this contractor
    await prisma.contractorAvailability.deleteMany({
      where: { contractorId: contractor.id },
    })

    // Create new availability records
    await prisma.contractorAvailability.createMany({
      data: availabilityData.map((item) => ({
        contractorId: contractor.id,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        isAvailable: item.isAvailable,
      })),
    })

    // Fetch the created records to return
    const savedAvailability = await prisma.contractorAvailability.findMany({
      where: { contractorId: contractor.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    return {
      success: true,
      message: 'Availability settings updated successfully',
      availability: savedAvailability,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid availability data',
        data: error.errors,
      })
    }

    console.error('Error updating availability:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update availability settings',
    })
  }
})
