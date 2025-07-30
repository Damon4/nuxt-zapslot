import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth'

const prisma = new PrismaClient()

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

  // For now, return default availability (9 AM - 6 PM, Monday to Friday)
  // In the future, this could be fetched from a contractor_availability table
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
})
