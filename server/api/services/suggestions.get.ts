import { z } from 'zod'
import { prisma } from '~/lib/prisma'

const schema = z.object({
  q: z.string().default(''),
  limit: z.number().min(1).max(20).default(8),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = schema.parse({
    q: query.q,
    limit: query.limit ? Number(query.limit) : 8,
  })

  const q = params.q || ''
  const limit = params.limit

  const isEmpty = q.trim().length === 0

  // Fetch service title suggestions; if q is empty, return recent titles
  const titles = await prisma.service.findMany({
    where: {
      isActive: true,
      contractor: { status: 1 },
      ...(isEmpty
        ? {}
        : {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }),
    },
    select: { title: true },
    orderBy: isEmpty ? { createdAt: 'desc' } : undefined,
    take: limit,
  })

  return {
    titles: [...new Set(titles.map((t) => t.title))].slice(0, limit),
  }
})
