import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for blocking time slots
const blockTimeSchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  reason: z.string().optional(),
})

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
      console.error('No contractor found for user:', session.user.id)
      throw createError({
        statusCode: 403,
        statusMessage: 'Contractor profile required',
      })
    }

    // Validate the time slot data
    const { date, startTime, endTime, reason } = blockTimeSchema.parse(body)

    // Validate that end time is after start time
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)

    if (end <= start) {
      throw createError({
        statusCode: 400,
        statusMessage: 'End time must be after start time',
      })
    }

    // Check if there's already a conflicting time slot
    const existingSlots = await prisma.timeSlot.findMany({
      where: {
        contractorId: contractor.id,
        date: new Date(date),
        isBlocked: true,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    })

    if (existingSlots.length > 0) {
      console.error('Conflicting time slots found:', existingSlots)
      throw createError({
        statusCode: 409, // Conflict status code
        statusMessage: `Time slot conflicts with existing blocked time: ${existingSlots.map((s) => `${s.startTime}-${s.endTime} (${s.reason || 'No reason'})`).join(', ')}`,
        data: {
          conflicts: existingSlots.map((slot) => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            reason: slot.reason,
          })),
        },
      })
    }

    // Create the blocked time slot
    const timeSlot = await prisma.timeSlot.create({
      data: {
        contractorId: contractor.id,
        date: new Date(date),
        startTime,
        endTime,
        isBlocked: true,
        reason,
      },
    })

    return {
      success: true,
      message: 'Time slot blocked successfully',
      timeSlot,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid time slot data',
        data: error.errors,
      })
    }

    // If it's already a createError with status code, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error blocking time slot:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to block time slot',
    })
  }
})
