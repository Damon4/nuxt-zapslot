import { z } from 'zod'
import { prisma } from '~/lib/prisma'
import { requireAuth } from '~/server/utils/auth'

const querySchema = z.object({
  interval: z.enum(['day', 'week']).optional().default('week'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

function startOfWeek(d: Date) {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // Monday = 0
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - day)
  return date
}

function startOfDay(d: Date) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  return date
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  let parsed: z.infer<typeof querySchema>
  try {
    parsed = querySchema.parse(q)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters',
        data: error.errors,
      })
    }
    throw error
  }

  const session = await requireAuth(event)
  const userId = session.user.id as string

  const contractor = await prisma.contractor.findUnique({ where: { userId } })
  if (!contractor)
    throw createError({
      statusCode: 403,
      statusMessage: 'Contractor account required',
    })

  const now = new Date()
  const to = parsed.to ? new Date(parsed.to) : now
  const from = parsed.from
    ? new Date(parsed.from)
    : new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30) // default 30 days

  // Fetch bookings within window
  const bookings = await prisma.booking.findMany({
    where: {
      service: { contractorId: contractor.id },
      status: { in: ['CONFIRMED', 'COMPLETED', 'CANCELLED'] },
      scheduledAt: { gte: from, lte: to },
    },
    select: { scheduledAt: true, status: true, totalPrice: true },
  })

  // Bucket by requested interval
  const buckets = new Map<
    string,
    {
      from: string
      to: string
      bookings: number
      cancellations: number
      revenue: number
    }
  >()

  if (parsed.interval === 'day') {
    let cursor = startOfDay(from)
    while (cursor <= to) {
      const start = new Date(cursor)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      const key = start.toISOString().slice(0, 10)
      buckets.set(key, {
        from: start.toISOString(),
        to: end.toISOString(),
        bookings: 0,
        cancellations: 0,
        revenue: 0,
      })
      cursor = end
    }

    for (const b of bookings) {
      const k = startOfDay(b.scheduledAt).toISOString().slice(0, 10)
      const bucket = buckets.get(k)
      if (!bucket) continue
      if (b.status === 'CANCELLED') bucket.cancellations += 1
      else bucket.bookings += 1
      if (b.totalPrice) bucket.revenue += Number(b.totalPrice)
    }
  } else {
    // week
    let cursor = startOfWeek(from)
    while (cursor <= to) {
      const start = new Date(cursor)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      const key = start.toISOString().slice(0, 10)
      buckets.set(key, {
        from: start.toISOString(),
        to: end.toISOString(),
        bookings: 0,
        cancellations: 0,
        revenue: 0,
      })
      cursor = end
    }

    for (const b of bookings) {
      const k = startOfWeek(b.scheduledAt).toISOString().slice(0, 10)
      const bucket = buckets.get(k)
      if (!bucket) continue
      if (b.status === 'CANCELLED') bucket.cancellations += 1
      else bucket.bookings += 1
      if (b.totalPrice) bucket.revenue += Number(b.totalPrice)
    }
  }

  const series = Array.from(buckets.values())
  return {
    success: true,
    data: {
      from: from.toISOString(),
      to: to.toISOString(),
      interval: parsed.interval,
      series,
    },
  }
})
