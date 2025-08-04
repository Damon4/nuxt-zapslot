import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

async function seedProduction() {
  console.log('🌱 Start production seeding...')

  // Only seed contractor categories for production
  console.log('📋 Seeding contractor categories...')
  const categories = [
    {
      name: '🔨 Repair and Construction',
      description: 'General repairs and construction work',
    },
    {
      name: '⚡ Electrical Work',
      description: 'Electrical installations and repairs',
    },
    { name: '🚿 Plumbing', description: 'Plumbing services and water systems' },
    {
      name: '🧹 Cleaning Services',
      description: 'Professional cleaning services',
    },
    {
      name: '💻 Computer Assistance',
      description: 'IT support and computer services',
    },
    {
      name: '🎨 Design and Interior',
      description: 'Interior design and decoration',
    },
    {
      name: '📚 Tutoring and Education',
      description: 'Educational and tutoring services',
    },
    {
      name: '💄 Beauty and Health',
      description: 'Beauty treatments and health services',
    },
    {
      name: '🚗 Auto Services',
      description: 'Automotive repair and maintenance',
    },
    {
      name: '📦 Courier Services',
      description: 'Delivery and courier services',
    },
    {
      name: '📸 Photo and Video',
      description: 'Photography and videography services',
    },
    {
      name: '⚖️ Legal Services',
      description: 'Legal consultation and services',
    },
    {
      name: '💼 Consulting (Business, IT, Finance)',
      description: 'Professional consulting services',
    },
    {
      name: '🔧 Minor Household Repairs',
      description: 'Small repairs around the house',
    },
    {
      name: '🎉 Event Organization',
      description: 'Event planning and organization',
    },
    {
      name: '🌐 Web Development and IT',
      description: 'Web development and IT services',
    },
    {
      name: '🌍 Translation Services',
      description: 'Translation and language services',
    },
    {
      name: '⚙️ Equipment Repair',
      description: 'Equipment and appliance repair',
    },
    {
      name: '🚚 Logistics and Transportation',
      description: 'Transportation and logistics',
    },
    { name: '📋 Other', description: 'Other miscellaneous services' },
  ]

  for (const category of categories) {
    await prisma.contractorCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('✅ Production seeding finished!')
  console.log('📊 Created:')
  console.log('  - 20 contractor categories')
  console.log('')
  console.log('ℹ️  Production seeding only includes essential data.')
  console.log('ℹ️  Test users and sample data are not created in production.')
}

seedProduction()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Production seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
