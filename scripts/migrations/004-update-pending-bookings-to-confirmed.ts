import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePendingBookingsToConfirmed() {
  console.log('🔄 Updating existing PENDING bookings to CONFIRMED...')

  const result = await prisma.booking.updateMany({
    where: {
      status: 'PENDING',
    },
    data: {
      status: 'CONFIRMED',
    },
  })

  console.log(`✅ Updated ${result.count} bookings from PENDING to CONFIRMED`)
}

export default updatePendingBookingsToConfirmed

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updatePendingBookingsToConfirmed()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}
