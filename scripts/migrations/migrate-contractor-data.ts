import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function migrateContractorData() {
  console.log('🔄 Starting contractor data migration...')

  try {
    // Get all contractors
    const contractors = await prisma.contractor.findMany()
    console.log(`📊 Found ${contractors.length} contractors to migrate`)

    for (const contractor of contractors) {
      const updates: {
        appliedAt?: Date
        priceRange?: string
        availability?: string
      } = {}

      // Migrate appliedAt from createdAt if not set
      if (!contractor.appliedAt && contractor.createdAt) {
        updates.appliedAt = contractor.createdAt
      }

      // Migrate price to priceRange if price exists and priceRange doesn't
      if (contractor.price && !contractor.priceRange) {
        updates.priceRange = contractor.price
      }

      // Set default availability if not set
      if (!contractor.availability) {
        updates.availability = 'FLEXIBLE'
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await prisma.contractor.update({
          where: { id: contractor.id },
          data: updates,
        })
        console.log(`✅ Updated contractor ${contractor.id}`)
      }
    }

    console.log('✨ Data migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration only if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateContractorData().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

// Export for migration runner
export default migrateContractorData
