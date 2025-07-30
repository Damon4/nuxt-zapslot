import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function addContractorCategories() {
  console.log('🔄 Adding default contractor categories...')

  try {
    const categories = [
      {
        name: 'Web Development',
        description:
          'Frontend, backend, and full-stack web development services',
        isActive: true,
      },
      {
        name: 'Design',
        description: 'Graphic design, UI/UX design, and branding services',
        isActive: true,
      },
      {
        name: 'Photography',
        description: 'Professional photography and video production services',
        isActive: true,
      },
      {
        name: 'Cleaning Services',
        description:
          'House cleaning, office cleaning, and maintenance services',
        isActive: true,
      },
      {
        name: 'Tutoring',
        description: 'Educational tutoring and coaching services',
        isActive: true,
      },
      {
        name: 'Fitness',
        description: 'Personal training, yoga, and fitness coaching',
        isActive: true,
      },
      {
        name: 'Beauty & Wellness',
        description: 'Hair styling, makeup, massage, and beauty services',
        isActive: true,
      },
      {
        name: 'Home Improvement',
        description: 'Plumbing, electrical, painting, and repair services',
        isActive: true,
      },
    ]

    let added = 0
    for (const category of categories) {
      const existing = await prisma.contractorCategory.findUnique({
        where: { name: category.name },
      })

      if (!existing) {
        await prisma.contractorCategory.create({
          data: category,
        })
        console.log(`✅ Added category: ${category.name}`)
        added++
      } else {
        console.log(`⏭️ Category already exists: ${category.name}`)
      }
    }

    console.log(
      `✨ Added ${added} new categories. Total categories available: ${categories.length}`
    )
  } catch (error) {
    console.error('❌ Failed to add categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Export default для migration runner
export default addContractorCategories

// Run если вызывается напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  addContractorCategories().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
