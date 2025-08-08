import { z } from 'zod'
import { prisma } from '~/lib/prisma'
import { requireAuth } from '~/server/utils/auth'

const querySchema = z.object({
  range: z
    .enum(['thisWeek', 'last7d', 'last14d', 'last30d', 'last90d', 'custom'])
    .optional()
    .default('last30d'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

function getDateRange(
  range: 'thisWeek' | 'last7d' | 'last14d' | 'last30d' | 'last90d' | 'custom',
  from?: string,
  to?: string
) {
  const now = new Date()
  let start: Date
  let end: Date = now

  switch (range) {
    case 'thisWeek':
      start = startOfWeek(now)
      break
    case 'last7d':
      start = new Date(now)
      start.setDate(start.getDate() - 7)
      break
    case 'last14d':
      start = new Date(now)
      start.setDate(start.getDate() - 14)
      break
    case 'last30d':
      start = new Date(now)
      start.setDate(start.getDate() - 30)
      break
    case 'last90d':
      start = new Date(now)
      start.setDate(start.getDate() - 90)
      break
    case 'custom':
      if (!from || !to)
        throw createError({
          statusCode: 400,
          statusMessage: 'from and to are required for custom range',
        })
      start = new Date(from)
      end = new Date(to)
      if (isNaN(start.getTime()) || isNaN(end.getTime()))
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid date range',
        })
      break
    default:
      start = new Date(now)
      start.setDate(start.getDate() - 30)
  }

  return { start, end }
}

export default defineEventHandler(async (event) => {
  // GET endpoint: parse query; require auth; compute analytics
  const q = getQuery(event)

  const parsed = (() => {
    try {
      return querySchema.parse(q)
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
  })()

  const session = await requireAuth(event)
  const userId = session.user.id as string

  const contractor = await prisma.contractor.findUnique({ where: { userId } })
  if (!contractor) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Contractor account required',
    })
  }

  const { start, end } = getDateRange(parsed.range, parsed.from, parsed.to)

  // Period totals (based on scheduledAt window)
  const [periodConfirmedCompleted, periodCancelled, periodRevenue] =
    await Promise.all([
      prisma.booking.count({
        where: {
          service: { contractorId: contractor.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          scheduledAt: { gte: start, lte: end },
        },
      }),
      prisma.booking.count({
        where: {
          service: { contractorId: contractor.id },
          status: 'CANCELLED',
          scheduledAt: { gte: start, lte: end },
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          service: { contractorId: contractor.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          scheduledAt: { gte: start, lte: end },
          totalPrice: { not: null },
        },
      }),
    ])

  // All-time totals
  const [allTimeConfirmedCompleted, allTimeCancelled, allTimeRevenue] =
    await Promise.all([
      prisma.booking.count({
        where: {
          service: { contractorId: contractor.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      }),
      prisma.booking.count({
        where: {
          service: { contractorId: contractor.id },
          status: 'CANCELLED',
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          service: { contractorId: contractor.id },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          totalPrice: { not: null },
        },
      }),
    ])

  // Top services by bookings and revenue (all-time)
  const [byBookingsRaw, byRevenueRaw] = await Promise.all([
    prisma.booking.groupBy({
      by: ['serviceId'],
      _count: { _all: true },
      where: {
        service: { contractorId: contractor.id },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      // Order in JS due to typing limitations
    }),
    prisma.booking.groupBy({
      by: ['serviceId'],
      _sum: { totalPrice: true },
      where: {
        service: { contractorId: contractor.id },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        totalPrice: { not: null },
      },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 5,
    }),
  ])

  // Top services by rating (min 3 reviews)
  const byRatingRaw = await prisma.review.groupBy({
    by: ['serviceId'],
    _avg: { rating: true },
    _count: { _all: true },
    where: { service: { contractorId: contractor.id } },
    orderBy: { _avg: { rating: 'desc' } },
    take: 5,
  })

  const serviceIds = Array.from(
    new Set([
      ...byBookingsRaw.map((b) => b.serviceId),
      ...byRevenueRaw.map((r) => r.serviceId),
      ...byRatingRaw.map((r) => r.serviceId),
    ])
  )

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, title: true },
  })
  const serviceMap = new Map(services.map((s) => [s.id, s]))

  const byBookings = byBookingsRaw
    .map((b) => ({
      serviceId: b.serviceId,
      countAll: (b as { _count?: { _all?: number } })._count?._all ?? 0,
    }))
    .sort((a, b) => b.countAll - a.countAll)
    .slice(0, 5)
    .map((b) => ({
      serviceId: b.serviceId,
      title: serviceMap.get(b.serviceId)?.title ?? `Service #${b.serviceId}`,
      bookingsCount: b.countAll,
    }))

  const byRevenue = byRevenueRaw.map((r) => ({
    serviceId: r.serviceId,
    title: serviceMap.get(r.serviceId)?.title ?? `Service #${r.serviceId}`,
    revenue: r._sum.totalPrice ? Number(r._sum.totalPrice) : 0,
  }))

  const byRating = byRatingRaw
    .filter((r) => (r._count._all ?? 0) >= 3)
    .map((r) => ({
      serviceId: r.serviceId,
      title: serviceMap.get(r.serviceId)?.title ?? `Service #${r.serviceId}`,
      averageRating: r._avg.rating ?? 0,
      reviewCount: r._count._all ?? 0,
    }))

  return {
    success: true,
    data: {
      range: { from: start.toISOString(), to: end.toISOString() },
      totals: {
        period: {
          bookings: periodConfirmedCompleted,
          cancellations: periodCancelled,
          revenue: periodRevenue._sum.totalPrice
            ? Number(periodRevenue._sum.totalPrice)
            : 0,
        },
        allTime: {
          bookings: allTimeConfirmedCompleted,
          cancellations: allTimeCancelled,
          revenue: allTimeRevenue._sum.totalPrice
            ? Number(allTimeRevenue._sum.totalPrice)
            : 0,
        },
      },
      topServices: {
        byBookings,
        byRevenue,
        byRating,
      },
    },
  }
})
