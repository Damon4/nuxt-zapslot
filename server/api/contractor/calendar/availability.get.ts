import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
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

  // Get availability from database
  const availability = await prisma.contractorAvailability.findMany({
    where: { contractorId: contractor.id },
    orderBy: { dayOfWeek: 'asc' },
  })

  // If no availability is set, return default availability (9 AM - 6 PM, Monday to Friday)
  if (availability.length === 0) {
    const defaultAvailability = [
      {
        id: 1,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      }, // Monday
      {
        id: 2,
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      }, // Tuesday
      {
        id: 3,
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      }, // Wednesday
      {
        id: 4,
        dayOfWeek: 4,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      }, // Thursday
      {
        id: 5,
        dayOfWeek: 5,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      }, // Friday
      {
        id: 6,
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '16:00',
        isAvailable: false,
      }, // Saturday
      {
        id: 7,
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '16:00',
        isAvailable: false,
      }, // Sunday
    ]

    return { availability: defaultAvailability }
  }

  return { availability }
})
