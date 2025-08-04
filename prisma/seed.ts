import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // Seed contractor categories
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

  // Seed test users
  console.log('👥 Seeding test users...')
  const testUsers = [
    {
      id: 'user-001',
      name: 'John Smith',
      email: 'john@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      isAdmin: false,
    },
    {
      id: 'user-002',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      isAdmin: false,
    },
    {
      id: 'user-003',
      name: 'Mike Davis',
      email: 'mike@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      isAdmin: false,
    },
    {
      id: 'user-004',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      isAdmin: false,
    },
    {
      id: 'user-005',
      name: 'David Brown',
      email: 'david@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      isAdmin: false,
    },
    {
      id: 'user-006',
      name: 'Lisa Garcia',
      email: 'lisa@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      isAdmin: false,
    },
    {
      id: 'user-007',
      name: 'Robert Chen',
      email: 'robert@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
      isAdmin: false,
    },
    {
      id: 'user-008',
      name: 'Maria Rodriguez',
      email: 'maria@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      isAdmin: false,
    },
    {
      id: 'user-009',
      name: 'Alex Thompson',
      email: 'alex@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      isAdmin: false,
    },
    {
      id: 'user-010',
      name: 'Jessica Kim',
      email: 'jessica@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica',
      isAdmin: false,
    },
  ]

  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  // Seed contractors
  console.log('🔨 Seeding contractors...')
  const contractorData = [
    {
      userId: 'user-001',
      description:
        'Professional electrician with 10+ years experience. Specialized in residential and commercial electrical work.',
      categories: '⚡ Electrical Work',
      experience: '10+ years',
      portfolio: 'https://johnsmith-electrician.com',
      price: '$80-120/hour',
      phone: '+1-555-0101',
      priceRange: '$80-120/hour',
      serviceArea: 'New York City, Brooklyn, Queens',
      website: 'https://johnsmith-electrician.com',
      socialLinks: JSON.stringify({
        linkedin: 'https://linkedin.com/in/johnsmith',
        facebook: 'https://facebook.com/johnsmithelectrician',
      }),
    },
    {
      userId: 'user-002',
      description:
        'Experienced house cleaner providing thorough and reliable cleaning services for homes and offices.',
      categories: '🧹 Cleaning Services',
      experience: '5+ years',
      portfolio: null,
      price: '$25-35/hour',
      phone: '+1-555-0102',
      priceRange: '$25-35/hour',
      serviceArea: 'Manhattan, Bronx',
      website: null,
      socialLinks: JSON.stringify({
        instagram: 'https://instagram.com/sarahcleans',
      }),
    },
    {
      userId: 'user-003',
      description:
        'Certified plumber specializing in emergency repairs, installations, and maintenance.',
      categories: '🚿 Plumbing',
      experience: '8+ years',
      portfolio: 'https://mikedavisplumbing.com/gallery',
      price: '$90-140/hour',
      phone: '+1-555-0103',
      priceRange: '$90-140/hour',
      serviceArea: 'Greater NYC Area',
      website: 'https://mikedavisplumbing.com',
      socialLinks: JSON.stringify({
        linkedin: 'https://linkedin.com/in/mikedavis',
        twitter: 'https://twitter.com/mikedavisplumb',
      }),
    },
    {
      userId: 'user-004',
      description:
        'Creative interior designer with a passion for modern and sustainable design solutions.',
      categories: '🎨 Design and Interior',
      experience: '6+ years',
      portfolio: 'https://emmawilsondesign.com/portfolio',
      price: '$100-150/hour',
      phone: '+1-555-0104',
      priceRange: '$100-150/hour',
      serviceArea: 'NYC, Westchester, Nassau County',
      website: 'https://emmawilsondesign.com',
      socialLinks: JSON.stringify({
        instagram: 'https://instagram.com/emmawilsondesign',
        pinterest: 'https://pinterest.com/emmawilsondesign',
      }),
    },
    {
      userId: 'user-005',
      description:
        'Full-stack web developer creating modern, responsive websites and web applications.',
      categories: '🌐 Web Development and IT',
      experience: '7+ years',
      portfolio: 'https://davidbrown.dev/portfolio',
      price: '$75-125/hour',
      phone: '+1-555-0105',
      priceRange: '$75-125/hour',
      serviceArea: 'Remote, NYC Metro Area',
      website: 'https://davidbrown.dev',
      socialLinks: JSON.stringify({
        github: 'https://github.com/davidbrown',
        linkedin: 'https://linkedin.com/in/davidbrown-dev',
      }),
    },
    {
      userId: 'user-006',
      description:
        'Professional auto mechanic specializing in car repairs, maintenance, and diagnostics.',
      categories: '🚗 Auto Services',
      experience: '12+ years',
      portfolio: 'https://lisagarcia-auto.com/gallery',
      price: '$65-95/hour',
      phone: '+1-555-0106',
      priceRange: '$65-95/hour',
      serviceArea: 'NYC, Long Island',
      website: 'https://lisagarcia-auto.com',
      socialLinks: JSON.stringify({
        facebook: 'https://facebook.com/lisagarciauto',
        yelp: 'https://yelp.com/biz/lisa-garcia-auto',
      }),
    },
    {
      userId: 'user-007',
      description:
        'Certified fitness trainer and nutritionist helping clients achieve their health goals.',
      categories: '💄 Beauty and Health',
      experience: '8+ years',
      portfolio: 'https://robertchen-fitness.com/testimonials',
      price: '$60-90/hour',
      phone: '+1-555-0107',
      priceRange: '$60-90/hour',
      serviceArea: 'Manhattan, Brooklyn',
      website: 'https://robertchen-fitness.com',
      socialLinks: JSON.stringify({
        instagram: 'https://instagram.com/robertchenfitness',
        youtube: 'https://youtube.com/c/robertchenfitness',
      }),
    },
    {
      userId: 'user-008',
      description:
        'Experienced math and science tutor with expertise in high school and college level subjects.',
      categories: '📚 Tutoring and Education',
      experience: '6+ years',
      portfolio: null,
      price: '$40-60/hour',
      phone: '+1-555-0108',
      priceRange: '$40-60/hour',
      serviceArea: 'NYC Metro Area',
      website: 'https://mariarodriguez-tutoring.com',
      socialLinks: JSON.stringify({
        linkedin: 'https://linkedin.com/in/maria-rodriguez-tutor',
      }),
    },
    {
      userId: 'user-009',
      description:
        'Professional photographer specializing in events, portraits, and commercial photography.',
      categories: '📸 Photo and Video',
      experience: '9+ years',
      portfolio: 'https://alexthompson-photo.com/portfolio',
      price: '$150-300/hour',
      phone: '+1-555-0109',
      priceRange: '$150-300/hour',
      serviceArea: 'NYC, New Jersey, Connecticut',
      website: 'https://alexthompson-photo.com',
      socialLinks: JSON.stringify({
        instagram: 'https://instagram.com/alexthompsonphoto',
        behance: 'https://behance.net/alexthompson',
      }),
    },
    {
      userId: 'user-010',
      description:
        'Licensed attorney providing legal consultation and services for individuals and small businesses.',
      categories: '⚖️ Legal Services',
      experience: '15+ years',
      portfolio: 'https://jessicakim-law.com/cases',
      price: '$200-350/hour',
      phone: '+1-555-0110',
      priceRange: '$200-350/hour',
      serviceArea: 'New York State',
      website: 'https://jessicakim-law.com',
      socialLinks: JSON.stringify({
        linkedin: 'https://linkedin.com/in/jessica-kim-attorney',
      }),
    },
  ]

  for (const contractor of contractorData) {
    await prisma.contractor.upsert({
      where: { userId: contractor.userId },
      update: {},
      create: contractor,
    })
  }

  // Seed services
  console.log('⚙️ Seeding services...')
  const servicesData = [
    // John Smith (Electrician) - ⚡ Electrical Work
    {
      contractorId: 1,
      title: 'Electrical Installation & Repair',
      description:
        'Complete electrical installation and repair services for residential and commercial properties.',
      category: '⚡ Electrical Work',
      price: 100.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 1,
      title: 'Emergency Electrical Services',
      description:
        '24/7 emergency electrical repair services for urgent electrical issues.',
      category: '⚡ Electrical Work',
      price: 150.0,
      priceType: 'HOURLY',
      duration: 60,
      availability: 'EMERGENCY',
    },

    // Sarah Johnson (Cleaner) - 🧹 Cleaning Services
    {
      contractorId: 2,
      title: 'Deep House Cleaning',
      description:
        'Comprehensive deep cleaning service for entire homes, including all rooms and surfaces.',
      category: '🧹 Cleaning Services',
      price: 120.0,
      priceType: 'FIXED',
      duration: 240,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 2,
      title: 'Office Cleaning',
      description:
        'Professional office cleaning services for small to medium businesses.',
      category: '🧹 Cleaning Services',
      price: 80.0,
      priceType: 'FIXED',
      duration: 180,
      availability: 'FLEXIBLE',
    },

    // Mike Davis (Plumber) - 🚿 Plumbing
    {
      contractorId: 3,
      title: 'Plumbing Repair & Maintenance',
      description:
        'Expert plumbing repair and maintenance services for all types of plumbing issues.',
      category: '🚿 Plumbing',
      price: 110.0,
      priceType: 'HOURLY',
      duration: 90,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 3,
      title: 'Bathroom Renovation Plumbing',
      description:
        'Complete plumbing services for bathroom renovations and new installations.',
      category: '🚿 Plumbing',
      price: 2500.0,
      priceType: 'FIXED',
      duration: 480,
      availability: 'PROJECT',
    },

    // Emma Wilson (Designer) - 🎨 Design and Interior
    {
      contractorId: 4,
      title: 'Interior Design Consultation',
      description:
        'Professional interior design consultation to transform your living space.',
      category: '🎨 Design and Interior',
      price: 125.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 4,
      title: 'Complete Room Makeover',
      description:
        'Full room design and makeover service including furniture selection and arrangement.',
      category: '🎨 Design and Interior',
      price: 1500.0,
      priceType: 'FIXED',
      duration: 720,
      availability: 'PROJECT',
    },

    // David Brown (Developer) - 🌐 Web Development and IT
    {
      contractorId: 5,
      title: 'Website Development',
      description:
        'Custom website development using modern technologies and responsive design.',
      category: '🌐 Web Development and IT',
      price: 95.0,
      priceType: 'HOURLY',
      duration: 480,
      availability: 'FLEXIBLE',
    },
    {
      contractorId: 5,
      title: 'Web Application Development',
      description:
        'Full-stack web application development with modern frameworks and databases.',
      category: '🌐 Web Development and IT',
      price: 5000.0,
      priceType: 'FIXED',
      duration: 2400,
      availability: 'PROJECT',
    },

    // Lisa Garcia (Auto) - 🚗 Auto Services
    {
      contractorId: 6,
      title: 'Car Repair & Maintenance',
      description:
        'Complete automotive repair and maintenance services for all vehicle types.',
      category: '🚗 Auto Services',
      price: 80.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 6,
      title: 'Vehicle Diagnostics',
      description:
        'Advanced computer diagnostics to identify and troubleshoot vehicle issues.',
      category: '🚗 Auto Services',
      price: 100.0,
      priceType: 'FIXED',
      duration: 60,
      availability: 'FLEXIBLE',
    },

    // Robert Chen (Fitness) - 💄 Beauty and Health
    {
      contractorId: 7,
      title: 'Personal Training Session',
      description:
        'One-on-one fitness training sessions tailored to your specific goals and fitness level.',
      category: '💄 Beauty and Health',
      price: 75.0,
      priceType: 'HOURLY',
      duration: 60,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 7,
      title: 'Nutrition Consultation',
      description:
        'Comprehensive nutrition assessment and meal planning for optimal health.',
      category: '💄 Beauty and Health',
      price: 120.0,
      priceType: 'FIXED',
      duration: 90,
      availability: 'SCHEDULED',
    },

    // Maria Rodriguez (Tutor) - 📚 Tutoring and Education
    {
      contractorId: 8,
      title: 'Math Tutoring',
      description:
        'Comprehensive math tutoring from algebra to calculus for high school and college students.',
      category: '📚 Tutoring and Education',
      price: 50.0,
      priceType: 'HOURLY',
      duration: 60,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 8,
      title: 'Science Tutoring',
      description:
        'Expert tutoring in physics, chemistry, and biology for students of all levels.',
      category: '📚 Tutoring and Education',
      price: 55.0,
      priceType: 'HOURLY',
      duration: 60,
      availability: 'SCHEDULED',
    },

    // Alex Thompson (Photographer) - 📸 Photo and Video
    {
      contractorId: 9,
      title: 'Event Photography',
      description:
        'Professional photography services for weddings, parties, and corporate events.',
      category: '📸 Photo and Video',
      price: 200.0,
      priceType: 'HOURLY',
      duration: 240,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 9,
      title: 'Portrait Photography',
      description:
        'Studio and outdoor portrait photography for individuals, families, and professionals.',
      category: '📸 Photo and Video',
      price: 150.0,
      priceType: 'FIXED',
      duration: 120,
      availability: 'FLEXIBLE',
    },

    // Jessica Kim (Lawyer) - ⚖️ Legal Services
    {
      contractorId: 10,
      title: 'Legal Consultation',
      description:
        'Professional legal advice and consultation for personal and business matters.',
      category: '⚖️ Legal Services',
      price: 275.0,
      priceType: 'HOURLY',
      duration: 60,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 10,
      title: 'Contract Review',
      description:
        'Thorough review and analysis of contracts and legal documents.',
      category: '⚖️ Legal Services',
      price: 500.0,
      priceType: 'FIXED',
      duration: 120,
      availability: 'FLEXIBLE',
    },

    // Additional services for remaining categories
    // 🔨 Repair and Construction
    {
      contractorId: 1, // John also does construction
      title: 'Home Repair Services',
      description:
        'General home repairs including drywall, painting, and minor construction work.',
      category: '🔨 Repair and Construction',
      price: 85.0,
      priceType: 'HOURLY',
      duration: 180,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 3, // Mike also does construction
      title: 'Kitchen Renovation',
      description:
        'Complete kitchen renovation services including plumbing and construction work.',
      category: '🔨 Repair and Construction',
      price: 3500.0,
      priceType: 'FIXED',
      duration: 960,
      availability: 'PROJECT',
    },

    // 💻 Computer Assistance
    {
      contractorId: 5, // David also does computer assistance
      title: 'Computer Repair & Setup',
      description:
        'Computer troubleshooting, repair, and setup services for home and office.',
      category: '💻 Computer Assistance',
      price: 80.0,
      priceType: 'HOURLY',
      duration: 90,
      availability: 'FLEXIBLE',
    },
    {
      contractorId: 5, // David
      title: 'Software Installation & Training',
      description:
        'Software installation, configuration, and user training for various applications.',
      category: '💻 Computer Assistance',
      price: 90.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'SCHEDULED',
    },

    // 📦 Courier Services
    {
      contractorId: 6, // Lisa also does courier work
      title: 'Local Delivery Service',
      description:
        'Fast and reliable local delivery services for packages and documents.',
      category: '📦 Courier Services',
      price: 25.0,
      priceType: 'FIXED',
      duration: 60,
      availability: 'FLEXIBLE',
    },
    {
      contractorId: 9, // Alex also does courier
      title: 'Express Courier Service',
      description:
        'Same-day express delivery service for urgent packages and documents.',
      category: '📦 Courier Services',
      price: 45.0,
      priceType: 'FIXED',
      duration: 90,
      availability: 'EMERGENCY',
    },

    // 💼 Consulting (Business, IT, Finance)
    {
      contractorId: 10, // Jessica also does business consulting
      title: 'Business Consultation',
      description:
        'Strategic business consulting for startups and small businesses.',
      category: '💼 Consulting (Business, IT, Finance)',
      price: 200.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 5, // David does IT consulting
      title: 'IT Strategy Consulting',
      description:
        'Technology strategy and digital transformation consulting for businesses.',
      category: '💼 Consulting (Business, IT, Finance)',
      price: 150.0,
      priceType: 'HOURLY',
      duration: 180,
      availability: 'SCHEDULED',
    },

    // 🔧 Minor Household Repairs
    {
      contractorId: 1, // John does minor repairs
      title: 'Handyman Services',
      description:
        'Quick fixes and minor repairs around the house including furniture assembly.',
      category: '🔧 Minor Household Repairs',
      price: 60.0,
      priceType: 'HOURLY',
      duration: 90,
      availability: 'FLEXIBLE',
    },
    {
      contractorId: 3, // Mike does minor repairs
      title: 'Appliance Repair',
      description:
        'Repair services for small household appliances and fixtures.',
      category: '🔧 Minor Household Repairs',
      price: 70.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'SCHEDULED',
    },

    // 🎉 Event Organization
    {
      contractorId: 4, // Emma does event planning
      title: 'Party Planning',
      description:
        'Complete party and event planning services including decoration and coordination.',
      category: '🎉 Event Organization',
      price: 800.0,
      priceType: 'FIXED',
      duration: 480,
      availability: 'PROJECT',
    },
    {
      contractorId: 9, // Alex does event photography/planning
      title: 'Wedding Coordination',
      description:
        'Professional wedding planning and coordination services for your special day.',
      category: '🎉 Event Organization',
      price: 1200.0,
      priceType: 'FIXED',
      duration: 720,
      availability: 'PROJECT',
    },

    // 🌍 Translation Services
    {
      contractorId: 8, // Maria does translation
      title: 'Document Translation',
      description:
        'Professional translation services for documents in Spanish, English, and Portuguese.',
      category: '🌍 Translation Services',
      price: 35.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'FLEXIBLE',
    },
    {
      contractorId: 10, // Jessica does legal translation
      title: 'Legal Document Translation',
      description: 'Certified translation of legal documents and contracts.',
      category: '🌍 Translation Services',
      price: 80.0,
      priceType: 'HOURLY',
      duration: 180,
      availability: 'SCHEDULED',
    },

    // ⚙️ Equipment Repair
    {
      contractorId: 6, // Lisa does equipment repair
      title: 'Small Engine Repair',
      description:
        'Repair services for lawnmowers, generators, and other small engine equipment.',
      category: '⚙️ Equipment Repair',
      price: 75.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 7, // Robert does fitness equipment repair
      title: 'Fitness Equipment Repair',
      description:
        'Repair and maintenance services for home and commercial fitness equipment.',
      category: '⚙️ Equipment Repair',
      price: 85.0,
      priceType: 'HOURLY',
      duration: 90,
      availability: 'FLEXIBLE',
    },

    // 🚚 Logistics and Transportation
    {
      contractorId: 6, // Lisa does transportation
      title: 'Moving Services',
      description:
        'Local moving and transportation services for furniture and household items.',
      category: '🚚 Logistics and Transportation',
      price: 90.0,
      priceType: 'HOURLY',
      duration: 240,
      availability: 'SCHEDULED',
    },
    {
      contractorId: 9, // Alex does logistics
      title: 'Equipment Transportation',
      description:
        'Specialized transportation for photography equipment and fragile items.',
      category: '🚚 Logistics and Transportation',
      price: 120.0,
      priceType: 'FIXED',
      duration: 180,
      availability: 'FLEXIBLE',
    },

    // 📋 Other
    {
      contractorId: 2, // Sarah does other services
      title: 'Pet Sitting',
      description:
        'Reliable pet sitting and dog walking services for busy pet owners.',
      category: '📋 Other',
      price: 30.0,
      priceType: 'HOURLY',
      duration: 120,
      availability: 'FLEXIBLE',
    },
    {
      contractorId: 4, // Emma does other services
      title: 'Personal Shopping',
      description:
        'Personal shopping and styling services for clothing and home decor.',
      category: '📋 Other',
      price: 50.0,
      priceType: 'HOURLY',
      duration: 180,
      availability: 'SCHEDULED',
    },
  ]

  for (const service of servicesData) {
    await prisma.service.create({
      data: service,
    })
  }

  // Seed contractor availability
  console.log('📅 Seeding contractor availability...')
  const availabilityData = [
    // John Smith availability (Monday-Friday, 8 AM - 6 PM)
    { contractorId: 1, dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
    { contractorId: 1, dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
    { contractorId: 1, dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
    { contractorId: 1, dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
    { contractorId: 1, dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },

    // Sarah Johnson availability (Tuesday-Saturday, 9 AM - 5 PM)
    { contractorId: 2, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
    { contractorId: 2, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
    { contractorId: 2, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
    { contractorId: 2, dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
    { contractorId: 2, dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },

    // Mike Davis availability (Monday-Friday, 7 AM - 7 PM)
    { contractorId: 3, dayOfWeek: 1, startTime: '07:00', endTime: '19:00' },
    { contractorId: 3, dayOfWeek: 2, startTime: '07:00', endTime: '19:00' },
    { contractorId: 3, dayOfWeek: 3, startTime: '07:00', endTime: '19:00' },
    { contractorId: 3, dayOfWeek: 4, startTime: '07:00', endTime: '19:00' },
    { contractorId: 3, dayOfWeek: 5, startTime: '07:00', endTime: '19:00' },

    // Emma Wilson availability (Monday-Thursday, 10 AM - 6 PM)
    { contractorId: 4, dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
    { contractorId: 4, dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
    { contractorId: 4, dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
    { contractorId: 4, dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },

    // David Brown availability (Monday-Friday, 9 AM - 9 PM)
    { contractorId: 5, dayOfWeek: 1, startTime: '09:00', endTime: '21:00' },
    { contractorId: 5, dayOfWeek: 2, startTime: '09:00', endTime: '21:00' },
    { contractorId: 5, dayOfWeek: 3, startTime: '09:00', endTime: '21:00' },
    { contractorId: 5, dayOfWeek: 4, startTime: '09:00', endTime: '21:00' },
    { contractorId: 5, dayOfWeek: 5, startTime: '09:00', endTime: '21:00' },

    // Lisa Garcia availability (Monday-Saturday, 8 AM - 6 PM)
    { contractorId: 6, dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
    { contractorId: 6, dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
    { contractorId: 6, dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
    { contractorId: 6, dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
    { contractorId: 6, dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
    { contractorId: 6, dayOfWeek: 6, startTime: '08:00', endTime: '18:00' },

    // Robert Chen availability (Monday-Friday & Sunday, 6 AM - 8 PM)
    { contractorId: 7, dayOfWeek: 0, startTime: '08:00', endTime: '16:00' },
    { contractorId: 7, dayOfWeek: 1, startTime: '06:00', endTime: '20:00' },
    { contractorId: 7, dayOfWeek: 2, startTime: '06:00', endTime: '20:00' },
    { contractorId: 7, dayOfWeek: 3, startTime: '06:00', endTime: '20:00' },
    { contractorId: 7, dayOfWeek: 4, startTime: '06:00', endTime: '20:00' },
    { contractorId: 7, dayOfWeek: 5, startTime: '06:00', endTime: '20:00' },

    // Maria Rodriguez availability (Monday-Friday, 3 PM - 9 PM)
    { contractorId: 8, dayOfWeek: 1, startTime: '15:00', endTime: '21:00' },
    { contractorId: 8, dayOfWeek: 2, startTime: '15:00', endTime: '21:00' },
    { contractorId: 8, dayOfWeek: 3, startTime: '15:00', endTime: '21:00' },
    { contractorId: 8, dayOfWeek: 4, startTime: '15:00', endTime: '21:00' },
    { contractorId: 8, dayOfWeek: 5, startTime: '15:00', endTime: '21:00' },

    // Alex Thompson availability (Tuesday-Saturday, 10 AM - 8 PM)
    { contractorId: 9, dayOfWeek: 2, startTime: '10:00', endTime: '20:00' },
    { contractorId: 9, dayOfWeek: 3, startTime: '10:00', endTime: '20:00' },
    { contractorId: 9, dayOfWeek: 4, startTime: '10:00', endTime: '20:00' },
    { contractorId: 9, dayOfWeek: 5, startTime: '10:00', endTime: '20:00' },
    { contractorId: 9, dayOfWeek: 6, startTime: '10:00', endTime: '20:00' },

    // Jessica Kim availability (Monday-Friday, 9 AM - 5 PM)
    { contractorId: 10, dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
    { contractorId: 10, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
    { contractorId: 10, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
    { contractorId: 10, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
    { contractorId: 10, dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
  ]

  for (const availability of availabilityData) {
    await prisma.contractorAvailability.upsert({
      where: {
        contractorId_dayOfWeek: {
          contractorId: availability.contractorId,
          dayOfWeek: availability.dayOfWeek,
        },
      },
      update: {},
      create: availability,
    })
  }

  // Seed some sample bookings
  console.log('📝 Seeding sample bookings...')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 0, 0, 0)

  // Create sample bookings between users (user-001 books services from others)
  const bookingsData = [
    {
      serviceId: 3, // Sarah's Deep House Cleaning
      clientId: 'user-001', // John books Sarah's service
      scheduledAt: tomorrow,
      duration: 240,
      totalPrice: 120.0,
      notes: 'Full house deep cleaning before guests arrive',
    },
    {
      serviceId: 7, // Emma's Interior Design Consultation
      clientId: 'user-002', // Sarah books Emma's service
      scheduledAt: nextWeek,
      duration: 120,
      totalPrice: 125.0,
      notes: 'Need consultation for living room redesign',
    },
  ]

  for (const booking of bookingsData) {
    await prisma.booking.create({
      data: booking,
    })
  }

  console.log('✅ Seeding finished!')
  console.log('📊 Created:')
  console.log('  - 20 contractor categories')
  console.log('  - 10 test users')
  console.log('  - 10 contractors with profiles')
  console.log('  - 40 services across all categories (2 per category)')
  console.log('  - Contractor availability schedules')
  console.log('  - 2 sample bookings')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
