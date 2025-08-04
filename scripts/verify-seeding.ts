import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

async function verifySeeding() {
  console.log('🔍 Verifying seeded data...\n')

  // Count records
  const userCount = await prisma.user.count()
  const contractorCount = await prisma.contractor.count()
  const serviceCount = await prisma.service.count()
  const categoryCount = await prisma.contractorCategory.count()
  const availabilityCount = await prisma.contractorAvailability.count()
  const bookingCount = await prisma.booking.count()

  console.log('📊 Record Counts:')
  console.log(`  Users: ${userCount}`)
  console.log(`  Contractors: ${contractorCount}`)
  console.log(`  Services: ${serviceCount}`)
  console.log(`  Categories: ${categoryCount}`)
  console.log(`  Availability Records: ${availabilityCount}`)
  console.log(`  Bookings: ${bookingCount}\n`)

  // Show users
  console.log('👥 Users:')
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      contractor: {
        select: {
          id: true,
          categories: true,
        },
      },
    },
  })

  users.forEach((user) => {
    const role = user.contractor ? 'Contractor' : 'Client'
    const category = user.contractor ? ` (${user.contractor.categories})` : ''
    console.log(`  - ${user.name} (${user.email}) - ${role}${category}`)
  })

  // Show contractors with services
  console.log('\n🔨 Contractors and their services:')
  const contractors = await prisma.contractor.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      services: {
        select: {
          title: true,
          price: true,
          priceType: true,
        },
      },
    },
  })

  contractors.forEach((contractor) => {
    console.log(`  - ${contractor.user.name} (${contractor.categories})`)
    contractor.services.forEach((service) => {
      const price = service.price ? `$${service.price}` : 'TBD'
      console.log(`    • ${service.title} - ${price} ${service.priceType}`)
    })
  })

  // Show recent bookings
  console.log('\n📝 Recent bookings:')
  const bookings = await prisma.booking.findMany({
    include: {
      client: {
        select: {
          name: true,
        },
      },
      service: {
        select: {
          title: true,
          contractor: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })

  bookings.forEach((booking) => {
    const date = booking.scheduledAt.toLocaleDateString()
    const time = booking.scheduledAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    console.log(
      `  - ${booking.client.name} → ${booking.service.contractor.user.name}`
    )
    console.log(`    Service: ${booking.service.title}`)
    console.log(`    Date: ${date} at ${time}`)
    console.log(`    Price: $${booking.totalPrice}`)
    console.log('')
  })

  console.log('✅ Verification complete!')
}

verifySeeding()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Verification failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
