import { z } from 'zod'
import { prisma } from '~/lib/prisma'

const schema = z.object({
  q: z.string().min(1),
  limit: z.number().min(1).max(20).default(8),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = schema.parse({
    q: query.q,
    limit: query.limit ? Number(query.limit) : 8,
  })

  const q = params.q
  const limit = params.limit

  // Parallel fetch simple suggestions
  const [titles, categories, locations] = await Promise.all([
    prisma.service.findMany({
      where: {
        isActive: true,
        contractor: { status: 1 },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { title: true },
      take: limit,
    }),
    prisma.service.findMany({
      where: {
        isActive: true,
        contractor: { status: 1 },
        category: { contains: q, mode: 'insensitive' },
      },
      select: { category: true },
      distinct: ['category'],
      take: limit,
    }),
    prisma.contractor.findMany({
      where: {
        status: 1,
        serviceArea: { contains: q, mode: 'insensitive' },
      },
      select: { serviceArea: true },
      take: limit,
    }),
  ])

  return {
    titles: [...new Set(titles.map((t) => t.title))].slice(0, limit),
    categories: categories.map((c) => c.category),
    locations: [
      ...new Set(locations.map((l) => l.serviceArea).filter(Boolean)),
    ].slice(0, limit),
  }
})
