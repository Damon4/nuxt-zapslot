# ZapSlot - Modern Appointment Booking Platform

[![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82?style=flat&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.x-FF6B6B?style=flat)](https://www.better-auth.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, full-stack Nuxt 4 application for appointment booking with enterprise-grade authentication and user management.

## ✨ Features

### 🔐 Authentication & Security
- **Secure Authentication**: GitHub OAuth integration with Better Auth
- **Server-Side Protection**: SSR authentication with protected routes
- **Session Management**: HTTP-only cookies with automatic refresh

### � User Management
- **User Profile Management**: Complete profile editing with real-time validation
- **User Dashboard**: Comprehensive dashboard with statistics and activity overview
- **Role-Based Access**: Contractor and client role management

### 📅 Advanced Booking System
- **Smart Slot Generation**: Duration-aware availability calculation
- **Real-time Validation**: Proactive date/time validation preventing invalid bookings
- **Conflict Detection**: Automatic prevention of overlapping appointments
- **Service Management**: Full CRUD operations for contractor services
- **Booking Calendar**: Visual calendar integration with availability management
- **Flexible Scheduling**: Support for various service durations and availability patterns

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first design that works on all devices
- **Theme System**: Automatic dark/light mode with user preference saving
- **Real-time Feedback**: Instant validation and loading states
- **Accessibility**: WCAG compliant with keyboard navigation support

### 🔧 Technical Excellence
- **Type Safety**: Full TypeScript support across client and server
- **PostgreSQL Database**: Robust data persistence with Prisma ORM
- **Performance**: Optimized for speed with Nuxt 4's latest features
- **Developer Tools**: ESLint, Prettier, Husky for code quality
- **Testing**: Comprehensive Playwright MCP testing coverage

## 🏗️ Tech Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript
- **Styling**: Tailwind CSS v4, DaisyUI
- **Authentication**: Better Auth with GitHub OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Tabler Icons via Nuxt Icon
- **State Management**: Pinia
- **Date Handling**: date-fns for robust date/time operations
- **Testing**: Playwright MCP for comprehensive E2E testing
- **Code Quality**: ESLint, Prettier, Husky, Lint-staged

## 📅 Booking System Architecture

### Smart Slot Generation
The booking system features an intelligent slot generation algorithm that:
- **Duration-Aware**: Considers service duration when generating available time slots
- **Conflict Detection**: Prevents overlapping bookings and respects blocked time slots
- **Flexible Intervals**: Supports 30-minute intervals with services of any duration
- **Working Hours**: Respects contractor availability and working schedules

### Real-time Validation
Frontend validation provides immediate feedback:
- **Date Range Validation**: Prevents selection of past dates or dates beyond availability
- **Time Filtering**: Automatically filters out past times for current date
- **Dynamic UI**: Real-time updates to available times based on date selection
- **User Feedback**: Clear messaging for invalid selections

### Database Models
```prisma
model Service {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  duration    Int?     // Duration in minutes
  price       String?
  category    String
  // ... additional fields
}

model ContractorAvailability {
  id           Int     @id @default(autoincrement())
  contractorId Int
  dayOfWeek    Int     // 0-6 (Sunday to Saturday)
  startTime    String  // HH:mm format
  endTime      String  // HH:mm format
  isAvailable  Boolean @default(true)
}

model Booking {
  id          Int      @id @default(autoincrement())
  serviceId   Int
  userId      Int
  scheduledAt DateTime
  status      BookingStatus
  notes       String?
  // ... additional tracking fields
}
```

## 🔐 Authentication Architecture

This application implements **enterprise-grade server-side authentication** for maximum security:

### 🛡️ Server-Side Protection
- Routes `/dashboard` and `/profile` are protected by server-side middleware
- Authentication validation occurs before page rendering (SSR)
- Unauthorized users are redirected before any sensitive data loads
- All API endpoints require valid session authentication
- No client-side authentication bypass possible

### 🔒 Security Features
- Server-side session validation using Better Auth
- Secure HTTP-only cookie-based session management  
- CSRF protection built-in
- Protected data never loads for unauthenticated users
- Automatic session refresh and validation

### 📁 Implementation Details
- `middleware/auth.global.ts` - Global server-side authentication middleware
- `server/api/auth/` - Authentication API routes and session management
- `server/utils/auth.ts` - Server-side authentication utilities
- `lib/auth.ts` - Better Auth configuration
- `stores/auth.ts` - Pinia store for client-side auth state
- `composables/useAuth.ts` - Client-side authentication composable

## 📄 Pages & Routes

### Public Routes
- `/` - Landing page with service directory and authentication
- `/services` - Public service catalog with search and filtering
- `/services/[id]` - Individual service details with booking interface

### Protected Routes (🔒 Authentication Required)
- `/dashboard` - User dashboard with booking history and statistics
- `/profile` - Complete user profile management interface
- `/my-bookings` - Client booking management and history
- `/my-bookings/[id]` - Individual booking details and management

### Contractor Routes (🔧 Contractor Access Required)
- `/contractor/services` - Service management interface for contractors
- `/contractor/bookings` - Contractor booking management dashboard
- `/contractor/calendar` - Calendar view for booking and availability management

### Admin Routes (� Admin Access Required)
- `/admin/contractors` - Contractor management and moderation interface

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - GitHub OAuth sign-in
- `POST /api/auth/signout` - User sign-out
- `GET /api/auth/get-session` - Session validation

### User Management  
- `GET /api/user/profile` - Fetch user profile data
- `PATCH /api/user/profile` - Update user profile information

### Contractor Management
- `POST /api/contractor/apply` - Submit contractor application
- `GET /api/contractor/profile` - Get contractor profile
- `PUT /api/contractor/profile` - Update contractor profile

### Service Management
- `GET /api/contractor/services` - Get contractor's services
- `POST /api/contractor/services` - Create new service
- `PUT /api/contractor/services/[id]` - Update service
- `DELETE /api/contractor/services/[id]` - Delete service
- `PATCH /api/contractor/services/[id]/status` - Toggle service status

### Public Service Discovery
- `GET /api/contractors` - Search and filter contractors
- `GET /api/contractors/[id]` - Get contractor public profile
- `GET /api/contractors/categories` - Get service categories
- `GET /api/services/[id]` - Get service details
- `GET /api/services/[id]/available-slots` - Get available booking slots

### Booking Management
- `POST /api/services/[id]/book` - Create new booking
- `GET /api/contractor/bookings` - Get contractor's bookings
- `PATCH /api/contractor/bookings/[id]/status` - Update booking status
- `GET /api/user/bookings` - Get user's bookings

### Admin Endpoints
- `GET /api/admin/contractors` - Get all contractors for moderation
- `PATCH /api/admin/contractors/[id]/status` - Update contractor status

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- GitHub OAuth App (for authentication)

### 1. Clone the repository

```bash
git clone https://github.com/Damon4/nuxt-zapslot.git
cd zapslot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zapslot"

# GitHub OAuth (create app at https://github.com/settings/developers)
AUTH_GITHUB_CLIENT_ID="your_github_client_id"
AUTH_GITHUB_CLIENT_SECRET="your_github_client_secret"

# Optional: Custom base URL
NUXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Open Prisma Studio to view your data
npx prisma studio

# Optional: Seed database with test data
npm run db:seed
```

### 5. Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## 🏗️ Production Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Production Environment Variables

Ensure all environment variables are properly set in your production environment:

```env
DATABASE_URL="your_production_database_url"
AUTH_GITHUB_CLIENT_ID="your_github_client_id"
AUTH_GITHUB_CLIENT_SECRET="your_github_client_secret"
NUXT_PUBLIC_BASE_URL="https://your-domain.com"
```

## 🔧 Development Tools

### Code Quality
- **ESLint**: Linting with Nuxt ESLint configuration
- **Prettier**: Code formatting with Tailwind CSS plugin
- **Husky**: Git hooks for pre-commit validation
- **Lint-staged**: Run linters on staged files only

### Database Tools
- **Prisma Studio**: Visual database browser
- **Prisma Migrate**: Database schema migrations
- **Data Migrations**: Automated data migration system
- **Database Seeding**: Development data seeding with realistic test data

## 🔄 Migration System

This project includes an automated data migration system that works alongside Prisma schema migrations.

### Migration Types

**Schema Migrations (Prisma)**
- Managed by `prisma migrate` commands
- Handle database structure changes
- Stored in `prisma/migrations/`

**Data Migrations (Custom)**
- Managed by our custom migration runner
- Handle data transformations and seeding
- Stored in `scripts/migrations/`
- Tracked in `_data_migrations` table

### Migration Commands

```bash
# Development (fast startup)
npm run dev              # Normal development without auto-migrations

# Development with migrations
npm run dev:migrate      # Development with automatic migrations

# Production builds
npm run build            # Build with automatic migrations
npm run build:simple     # Build without migrations

# Manual migration control
npm run migrate          # Run data migrations only
npm run migrate:dev      # Create new schema migration
npm run migrate:reset    # Reset and re-run all migrations
npm run db:push          # Push schema changes without migrations
npm run db:studio        # Open Prisma Studio

# Database seeding
npm run db:seed          # Populate database with test data
npm run db:verify        # Verify seeded data
```

## 🌱 Database Seeding

The project includes a comprehensive seeding system that populates your database with realistic test data for development.

### What Gets Seeded

- **20 Service Categories**: All supported contractor categories
- **10 Test Users**: Contractor/client users for testing
- **10 Contractors**: Realistic contractor profiles with different specializations
- **40 Services**: Complete coverage of all 20 categories (2 per category)
- **Availability Schedules**: Realistic working hours for each contractor
- **Sample Bookings**: Example bookings for testing

### Seeding Commands

```bash
# Seed the database with test data
npm run db:seed

# Production-safe seeding (only categories)
npm run db:seed:prod

# Reset database and reseed
npm run migrate:reset
npm run db:seed

# Verify seeded data
npm run db:verify
```

### Test Data Overview

| User | Role | Specialization | Services |
|------|------|----------------|----------|
| John Smith | Contractor | ⚡ Electrical + 🔨 Construction | 4 services |
| Sarah Johnson | Contractor | 🧹 Cleaning + 📋 Other | 3 services |
| Mike Davis | Contractor | 🚿 Plumbing + 🔨 Construction | 4 services |
| Emma Wilson | Contractor | 🎨 Design + 🎉 Events | 4 services |
| David Brown | Contractor | 🌐 Web Dev + 💻 IT + 💼 Consulting | 5 services |
| Lisa Garcia | Contractor | 🚗 Auto + 📦 Courier + ⚙️ Equipment | 5 services |
| Robert Chen | Contractor | 💄 Health + ⚙️ Equipment | 3 services |
| Maria Rodriguez | Contractor | 📚 Education + 🌍 Translation | 3 services |
| Alex Thompson | Contractor | 📸 Photo + 📦 Courier + � Events | 5 services |
| Jessica Kim | Contractor | ⚖️ Legal + 💼 Business + 🌍 Translation | 4 services |

The seeded data includes realistic:
- Price ranges ($25-$5000 for different service types)
- Service durations (60-2400 minutes for various projects)
- Contact information and portfolios
- Availability schedules (different days/hours)
- Social media links and websites
- Complete coverage of all 20 service categories

For production environments, use `npm run db:seed:prod` which only creates service categories without test users.

### Creating Data Migrations

1. Create a new file in `scripts/migrations/` with descriptive name:
   ```typescript
   // scripts/migrations/003-add-default-settings.ts
   import { PrismaClient } from '@prisma/client'
   
   const prisma = new PrismaClient()
   
   async function addDefaultSettings() {
     // Your migration logic here
     console.log('🔄 Adding default settings...')
     // ... migration code
     console.log('✅ Settings migration completed')
   }
   
   export default addDefaultSettings
   
   // Run if called directly
   if (import.meta.url === `file://${process.argv[1]}`) {
     addDefaultSettings()
       .catch(console.error)
       .finally(() => prisma.$disconnect())
   }
   ```

2. Run migrations: `npm run migrate`

The system automatically tracks executed migrations and prevents duplicate runs.

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:migrate      # Development with automatic migrations

# Production
npm run build            # Build with automatic migrations
npm run build:simple     # Build without migrations
npm run preview          # Preview production build

# Database & Migrations
npm run migrate          # Run data migrations
npm run migrate:dev      # Create new schema migration
npm run migrate:reset    # Reset and re-run all migrations
npm run db:push          # Push schema without migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Populate database with test data
npm run db:seed:prod     # Production-safe seeding (categories only)
npm run db:verify        # Verify seeded data

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
```

## 📁 Project Structure

```
zapslot/
├── assets/css/           # Global CSS and Tailwind imports
├── components/app/       # Reusable Vue components
├── composables/          # Vue composables for shared logic
├── layouts/              # Nuxt layouts
├── lib/                  # Authentication and utility libraries
├── middleware/           # Route middleware (auth protection)
├── pages/                # File-based routing pages
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── scripts/              # Build scripts and data migrations
│   └── migrations/       # Data migration files
├── server/               # API routes and server utilities
├── stores/               # Pinia state management
├── nuxt.config.ts        # Nuxt configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all checks pass (`npm run lint && npm run build`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📚 Resources

### 📖 Development Documentation
- [Development Guidelines](docs/development-guidelines.md) - Essential patterns and best practices for this project

### 🌐 External Documentation
- [Nuxt 4 Documentation](https://nuxt.com/docs/getting-started/introduction)
- [Better Auth Documentation](https://www.better-auth.com/docs/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Nuxt 4 and modern web technologies.
