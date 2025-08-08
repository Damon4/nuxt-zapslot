
# ZapSlot Platform - Comprehensive Implementation Guide

## 🎯 System Overview

ZapSlot is a comprehensive service booking platform built with Nuxt 3, featuring contractor management, service booking, calendar integration, and admin moderation. The platform provides immediate booking confirmation and real-time availability management for seamless user experience.

### Key Features

- **🚀 Immediate Booking Confirmation**: All service bookings confirmed instantly
- **👥 Multi-Role System**: Clients, Contractors, and Admins with proper access control
- **📅 Advanced Calendar Integration**: Real-time availability and booking management
- **⭐ Rating & Review System**: 1-5 star ratings with filtering and sorting capabilities
- **🔧 Auto-Approval System**: Contractors automatically approved upon application
- **📱 Responsive Design**: DaisyUI components with mobile-first approach
- **🛡️ Secure Authentication**: GitHub OAuth with session-based auth
- **🧪 Comprehensive Testing**: Playwright MCP for reliable E2E testing

## 1. Data Model

### Service (main service model)

```prisma
model Service {
  id            Int      @id @default(autoincrement())
  contractorId  Int
  contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)

  title         String   // service title
  description   String   // detailed description
  category      String   // category (from contractor-plan.md)
  price         Decimal? // price (can be null for "negotiable")
  priceType     String   @default("FIXED") // FIXED, HOURLY, NEGOTIABLE
  duration      Int?     // duration in minutes (optional)
  availability  String   @default("FLEXIBLE") // WEEKDAYS, WEEKENDS, MORNINGS, EVENINGS, FLEXIBLE

  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  bookings      Booking[]
  reviews       Review[]

  @@map("service")
}
```

### Booking (service bookings)

```prisma
model Booking {
  id          Int      @id @default(autoincrement())
  serviceId   Int
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  clientId    String
  client      User     @relation(fields: [clientId], references: [id], onDelete: Cascade)

  status      String   @default("CONFIRMED") // CONFIRMED, CANCELLED, COMPLETED
  scheduledAt DateTime // when the service is scheduled
  duration    Int?     // actual duration (may differ from Service.duration)
  totalPrice  Decimal? // final price (can be negotiable)
  notes       String?  // additional notes from the client

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("booking")
}
```

### Review (service reviews and ratings)

```prisma
model Review {
  id        Int      @id @default(autoincrement())
  serviceId Int
  clientId  String
  rating    Int      // 1-5 star rating
  comment   String?  // optional review comment
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  client    User     @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([serviceId])
  @@index([clientId])
  @@unique([serviceId, clientId]) // One review per client per service
  @@map("review")
}
```

## 2. API Endpoints

### Authentication & Response Format

**Authentication**: Session-based authentication with HTTP-only cookies and CSRF protection

**Base URLs:**
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

**Response Format:**
```json
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "data": { /* optional error details */ }
}
```

### Authentication Endpoints

- `POST /api/auth/signin` - Initiate GitHub OAuth sign-in
- `POST /api/auth/signout` - Sign out current user
- `GET /api/auth/get-session` - Get current user session

### User Management Endpoints

- `GET /api/user/profile` - Get current user's profile
- `PATCH /api/user/profile` - Update user profile
- `GET /api/user/bookings` - Get user's bookings
- `PATCH /api/user/bookings/:id/cancel` - Cancel booking

### For Contractors

- `GET /api/contractor/services` - list own services
- `POST /api/contractor/services` - create new service
- `PUT /api/contractor/services/:id` - edit service
- `DELETE /api/contractor/services/:id` - delete service
- `PATCH /api/contractor/services/:id/toggle` - enable/disable service

### For Contractor Profile Management

- `GET /api/contractor/profile` - get contractor profile
- `POST /api/contractor/apply` - submit contractor application (auto-approved)
- `PUT /api/contractor/profile` - update contractor profile
- `POST /api/contractor/delete` - delete contractor profile and all services

### For Clients

- `GET /api/services` - search and filter services (public, includes rating data)
- `GET /api/services/:id` - service details (public, includes reviews)
- `POST /api/services/:id/book` - book a service
- `GET /api/services/:id/available-slots` - get available time slots for booking
- `GET /api/services/search` - advanced search with rating filters

### For Contractors (booking management)

- `GET /api/contractor/bookings` - incoming bookings
- `PATCH /api/contractor/bookings/:id/status` - change booking status
- `POST /api/contractor/bookings/bulk-action` - bulk status updates

### Calendar Integration Endpoints

- `GET /api/contractor/calendar/bookings` - Get calendar bookings
- `GET /api/contractor/calendar/availability` - Get availability settings
- `POST /api/contractor/calendar/availability` - Set availability
- `POST /api/contractor/calendar/block-time` - Block time slot

### For Admins

- `GET /api/admin/services` - all services with filters
- `GET /api/admin/bookings` - all bookings with filters
- `GET /api/admin/contractors` - contractor management


## 3. Interface

### For Contractors

- **"My Services" page** (`/contractor/services`)
  - List of all services with edit option
  - "Add Service" button
  - Activity toggle for each service
  - Booking statistics

- **Service create/edit form**
  - Service title (required)
  - Description (required, rich text)
  - Category (dropdown from contractor categories)
  - Price type: fixed/hourly/negotiable
  - Price (if not negotiable)
  - Duration (optional)
  - Availability (dropdown)

- **"My Bookings" page** (`/contractor/bookings`)
  - Incoming bookings with status filters
  - Ability to confirm/reject bookings
  - Calendar view

### For Clients

- **Service search page** (`/services`)
  - Search by title/description
  - Filters: category, price, availability, contractor rating
  - Service cards with main info
  - Pagination

- **Service detail page** (`/services/:id`)
  - Full service description
  - Contractor info
  - Booking form with date/time selection
  - Reviews (future feature)

- **Booking form**
  - Date and time selection
  - Additional notes
  - Price confirmation
  - Contact info

- **"My Bookings" page** (`/my-bookings`)
  - Booking history
  - Booking statuses
  - Cancel option

### Common Components

- `ServiceCard.vue` - service card
- `BookingForm.vue` - booking form
- `BookingStatusBadge.vue` - booking status badge
- `ServiceForm.vue` - service create/edit form
- `PriceDisplay.vue` - price display (with type)


## 4. Validation and Business Logic

### Service Creation Rules

- Only active contractors can create services (status = 1)
- Auto-approval system: all contractor applications immediately approved
- Max 20 active services per contractor
- Service title: 10-100 characters
- Description: 50-2000 characters
- Price: positive number (if specified)

### Booking Rules

- Only authorized users can book
- Cannot book for a past date
- Booking at least 2 hours before the service
- One user can have max 10 active bookings

### Booking Statuses

**⚠️ IMPORTANT**: The booking system now provides immediate confirmation (as of August 2, 2025)

- `CONFIRMED` - automatically confirmed upon booking (no PENDING status)
- `CANCELLED` - cancelled (by client or contractor)
- `COMPLETED` - service completed

### Booking Flow Changes
- **Before**: User books → PENDING status → Contractor approval → CONFIRMED
- **Now**: User books → CONFIRMED status (immediate)

### Benefits of Immediate Confirmation
- **Improved UX**: Instant booking confirmation
- **Reduced Friction**: No waiting for contractor approval
- **Simpler Workflow**: Streamlined booking process
- **Better Conversion**: Users get immediate gratification

### Technical Notes
- Self-booking prevention remains active
- 2-hour advance booking requirement maintained
- Cancellation policies unchanged
- Legacy PENDING bookings preserved for historical data


## 5. Access Rights and Middleware

### Middleware

- `contractor-required.ts` - check contractor status
- `service-owner.ts` - check service owner
- `booking-participant.ts` - check booking participant

### Access Rights

- Create services: only active contractors (status = 1)
- Edit services: only owner
- View services: all users
- Booking: only authorized clients
- Manage bookings: service owner or client
- Delete contractor profile: only profile owner (cascades to all services)

## 6. Notifications & User Feedback

### Toast Notifications (Implemented)
- Service created/updated/deleted
- Booking sent/confirmed/cancelled
- New incoming booking (for contractor)
- Contractor application submitted and auto-approved
- Profile updates and deletions
- Availability changes and time slot blocking

### Real-time System Feedback
- **In-App Notifications**: Toast messages and notification center
- **Status Updates**: Real-time booking status changes
- **Form Validation**: Immediate feedback on form inputs
- **Loading States**: Visual indicators for async operations
- **Success Confirmations**: Clear confirmation of completed actions

### Notification Types
- Application submitted confirmation (auto-approved)
- New booking request notifications
- Booking status change alerts
- Profile update confirmations
- Service activation/deactivation notifications
- Calendar and availability updates


### Email Notifications (future feature)

- Booking confirmation
- Upcoming service reminder
- Booking status change


## 7. Search and Filtering

### Service Search Parameters

- `q` - text search by title and description
- `category` - filter by category
- `priceFrom`, `priceTo` - price range
- `availability` - availability
- `contractorId` - services of a specific contractor
- `minRating` - filter by minimum average rating (1-5)
- `sortBy` - sorting (price, createdAt, title, rating)
- `page`, `limit` - pagination


### Performance Indexes

```sql
CREATE INDEX idx_service_category ON service(category);
CREATE INDEX idx_service_active ON service(isActive);
CREATE INDEX idx_service_price ON service(price);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_scheduled ON booking(scheduledAt);
CREATE INDEX idx_review_service ON review(serviceId);
CREATE INDEX idx_review_client ON review(clientId);
```


## 8. Implementation Roadmap & Current Status

### ✅ Completed Infrastructure
- PostgreSQL database with User and Contractor models
- Authentication system with GitHub OAuth
- **Auto-approval contractor system** (all applications automatically approved)
- **Contractor profile deletion system** with cascading service removal
- Profile management for users and contractors
- Middleware for access control

### ✅ Completed Stages (1-8)

**Stage 1: Core Models and API ✅ COMPLETED**
- Service and Booking models implementation in Prisma
- Complete database schema with proper relationships
- Comprehensive API endpoints for CRUD operations
- Middleware system for access rights and authentication

**Stage 2: Contractor Interface ✅ COMPLETED**
- Complete contractor service management system
- Advanced service creation and editing capabilities
- Booking management with bulk actions
- Auto-approval contractor application system
- **Contractor profile deletion system** with service cascade removal

**Stage 3: Public Service Catalog ✅ COMPLETED**
- Public service discovery with advanced search
- Category-based filtering and price range filters
- Service detail pages with integrated booking
- Complete end-to-end booking workflow

**Stage 4: Client Booking Management ✅ COMPLETED**
- Individual booking detail pages (`/my-bookings/[id]`)
- Booking cancellation functionality  
- Enhanced notifications system
- Improved contractor booking management

**Stage 5: Booking Details and Actions ✅ COMPLETED**
- Enhanced booking detail pages with full information
- Time-based cancellation policies and validation
- Contractor bulk actions for booking management
- Advanced notifications and user feedback

**Stage 6: Service Management & Public Catalog ✅ COMPLETED**
- Complete contractor service management interface
- Public service catalog with search and filtering
- Service detail pages with integrated booking
- Full end-to-end booking workflow

### ✅ Recently Completed Stages

**Stage 7: Calendar Integration ✅ COMPLETED** (August 2, 2025)
1. ✅ **Enhanced Slot Generation System**
   - Duration-aware slot logic with service duration consideration
   - Smart slot calculation with `lastPossibleSlotStart` logic
   - 30-minute slot intervals with proper service duration handling
   - Comprehensive conflict detection against existing bookings

2. ✅ **Frontend Booking Validation**
   - Date range validation preventing past and out-of-range selections
   - Automatic filtering of past times for current date selections
   - Real-time UI feedback for invalid date/time combinations
   - Smart time field reset when date changes invalidate selection

3. ✅ **API Improvements**
   - Enhanced Available Slots Endpoint: `/api/services/[id]/available-slots.get.ts`
   - Service duration integration (120-minute services properly handled)
   - Multi-day slot generation (14-day availability window)
   - Next available slot automatic suggestion

4. ✅ **Homepage Redesign Enhancement**
   - Complete landing page redesign with search integration
   - Real-time platform statistics and interactive category navigation
   - Fixed category mapping and enhanced user engagement elements

**Stage 8: Review & Rating System ✅ COMPLETED** (August 8, 2025)
   - Service duration integration (120-minute services properly handled)
   - Multi-day slot generation (14-day availability window)
   - Next available slot automatic suggestion

4. ✅ **Homepage Redesign Enhancement**
   - Complete landing page redesign with search integration
   - Real-time platform statistics and interactive category navigation
   - Fixed category mapping and enhanced user engagement elements

**Stage 8: Review & Rating System ✅ COMPLETED**
- ✅ Review database schema with rating (1-5) and comments
- ✅ Star rating display on service cards with review counts
- ✅ Rating filter system (4+ Stars, 3+ Stars, etc.)
- ✅ Sort by "Highest Rated" functionality
- ✅ Rating aggregation and averages calculation
- ✅ Comprehensive data seeding with 401 realistic reviews
- ✅ Playwright MCP testing of rating filter functionality

**Stage 9: Advanced Search & Filtering 📋 NEXT**
- **Enhanced filtering capabilities**
  - Complete price range filters (min/max) in UI
  - Availability filters (weekdays, weekends, mornings, evenings)
  - Geographic location-based search
  - Contractor rating and review count filters
  - Advanced search with autocomplete and suggestions
  - Saved search functionality
  - Search history and recommendations

**Stage 10: Analytics Dashboard 📋 PLANNED**
- **Contractor analytics dashboard**
  - Booking statistics and trends visualization
  - Revenue tracking and projections
  - Service performance metrics
  - Client booking patterns analysis
  - Monthly/yearly performance reports
  - Peak time identification and optimization
  - Pricing optimization suggestions

### 🔮 Future Stages
- Email notification system for booking updates
- Real-time notifications (WebSocket/SSE implementation)
- Payment integration
- Performance optimizations and caching strategies
- Mobile app notifications

## ⚠️ Contractor Management System

### Overview
The contractor management system enables users to apply for contractor status with **automatic approval**. The system includes contractor profile management, service creation, and complete profile deletion capabilities.

### Auto-Approval System
- **All contractor applications are automatically approved**
- No waiting for admin review or moderation
- Status immediately set to ACTIVE (status = 1) upon application
- Streamlined onboarding process for contractors

### Key Features
- **Profile Management**: Complete contractor profile editing capabilities  
- **Service Management**: Create, edit, and manage services
- **Profile Deletion**: Permanent profile removal with cascading service deletion
- **Booking Management**: Handle incoming service bookings
- **Calendar Integration**: Visual booking management with calendar interface

### Contractor Categories (20 categories)
1. 🔨 Repair and Construction
2. ⚡ Electrical Work
3. 🚿 Plumbing
4. 🧹 Cleaning Services
5. 💻 Computer Assistance
6. 🎨 Design and Interior
7. 📚 Tutoring and Education
8. 💄 Beauty and Health
9. 🚗 Auto Services
10. 📦 Courier Services
11. 📸 Photo and Video
12. ⚖️ Legal Services
13. 💼 Consulting (Business, IT, Finance)
14. 🔧 Minor Household Repairs
15. 🎉 Event Organization
16. 🌐 Web Development and IT
17. 🌍 Translation Services
18. ⚙️ Equipment Repair
19. 🚚 Logistics and Transportation
20. 📋 Other

### Database Schema Extensions
```prisma
model Contractor {
  id           Int      @id @default(autoincrement())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status       ContractorStatus @default(ACTIVE) // Auto-approved
  description  String   // Service description
  categories   String   // JSON array of selected categories
  experience   String?  // Years of experience description
  portfolio    String?  // Portfolio description or links
  priceRange   String?  // Price range or "negotiable"
  availability String   @default("FLEXIBLE")
  
  appliedAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  services     Service[]
  bookings     Booking[]
  availability ContractorAvailability[]
  timeSlots    TimeSlot[]
  
  @@map("contractor")
}

model ContractorAvailability {
  id           Int        @id @default(autoincrement())
  contractorId Int
  contractor   Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  dayOfWeek    Int        // 0-6 (Sunday to Saturday)
  startTime    String     // HH:mm format
  endTime      String     // HH:mm format
  isAvailable  Boolean    @default(true)
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  @@unique([contractorId, dayOfWeek])
}

model TimeSlot {
  id           Int        @id @default(autoincrement())
  contractorId Int
  contractor   Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  date         DateTime   // Date for the blocked slot
  startTime    String     // HH:mm format
  endTime      String     // HH:mm format
  reason       String?    // Reason for blocking
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  @@map("time_slot")
}
```

### Access Control Levels
1. **Guest Users**: Public contractor directory
2. **Authenticated Users**: Apply for contractor status (auto-approved), book services
3. **Active Contractors**: Full contractor dashboard, service management
4. **Administrators**: Full system access, contractor management capabilities

## 9. Known Issues & Technical Debt

### Current Development Focus
- **Stage 7**: Calendar integration with drag-and-drop functionality
- **Testing**: Comprehensive Playwright MCP testing across all features
- **Performance**: Database query optimization and caching strategies
- **Documentation**: API documentation and user guides

### Remaining High-Priority Tasks
- Complete calendar integration with advanced scheduling
- Real-time notifications (WebSocket/SSE implementation)
- Email notification system for booking updates
- Review and rating system after completed bookings

### Future Technical Improvements
- Advanced scheduling calendar component with conflict detection
- Automated booking reminders and notifications
- Payment integration with Stripe/PayPal
- Advanced analytics and reporting dashboard
- Mobile app notifications and responsive improvements

## 10. System Architecture & Technical Stack

### Core Technologies
- **Framework**: Nuxt 3 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: DaisyUI with Tailwind CSS
- **Auth**: Custom authentication system with GitHub OAuth
- **Testing**: Playwright MCP for E2E testing
- **Deployment**: Vercel with Docker support

### Key Components Structure
```
components/
├── calendar/
│   ├── CalendarView.vue              # Main calendar component
│   └── TimeSlotManager.vue           # Time slot management
├── modals/
│   ├── AvailabilityEditorModal.vue   # Availability settings
│   ├── BlockTimeModal.vue            # Block time slots
│   ├── BookingDetailsModal.vue       # Booking information
│   ├── QuickBookingModal.vue         # Quick booking creation
│   └── RescheduleModal.vue           # Booking rescheduling
├── ContractorApplicationModal.vue    # Contractor application
├── ContractorEditModal.vue           # Profile editing
├── ContractorProfileBlock.vue        # Profile management
├── ServiceCard.vue                   # Service display
├── ServiceForm.vue                   # Service creation/editing
└── app/
    ├── Navbar.vue                    # Navigation
    ├── AuthButton.vue                # Authentication
    └── NotificationToast.vue         # Notifications
```

### API Structure
```
server/api/
├── contractor/                       # Contractor functionality
│   ├── apply.post.ts                # Submit application
│   ├── profile.get.ts               # Get profile
│   ├── profile.put.ts               # Update profile
│   ├── delete.post.ts               # Delete profile
│   ├── services/                    # Service management
│   ├── bookings/                    # Booking management
│   └── calendar/                    # Calendar integration
├── services/                        # Public service APIs
│   ├── index.get.ts                 # Search services
│   ├── [id].get.ts                  # Get service details
│   ├── [id]/
│   │   ├── book.post.ts            # Book service
│   │   └── available-slots.get.ts  # Get availability
├── user/                            # User management
│   ├── profile.get.ts               # Get user profile
│   ├── profile.patch.ts             # Update profile
│   └── bookings/                    # User bookings
└── admin/                           # Admin operations
    └── contractors/                 # Contractor moderation
```

### Database Relationships
- **User** → **Contractor** (1:0..1)
- **Contractor** → **Service** (1:many)
- **Service** → **Booking** (1:many)
- **User** → **Booking** (1:many as client)
- **Contractor** → **ContractorAvailability** (1:many)
- **Contractor** → **TimeSlot** (1:many)

### Security & Authorization
- **Middleware**: contractor.ts, admin.ts, auth.global.ts
- **Session Management**: HTTP-only cookies with CSRF protection
- **Route Protection**: Page-level and API-level authentication
- **Role-based Access**: User, Contractor, Admin role verification

## 11. Technical Implementation Details

### Critical Development Rules

**⚠️ IMPORTANT: Request Body Reading Order**
When working with Nuxt 3 API endpoints, **always read request body FIRST**:

```typescript
export default defineEventHandler(async (event) => {
  try {
    // ✅ CORRECT: Read request body first
    const body = await readBody(event)

    // ✅ CORRECT: Then check authorization
    const session = await requireAuth(event)

    // Rest of the logic...
  } catch (error) {
    // Error handling
  }
})
```

### Data Validation (Zod Schemas)

```typescript
// Service validation
const serviceSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),
  category: z.enum([...categories]),
  price: z.number().positive().optional(),
  priceType: z.enum(['FIXED', 'HOURLY', 'NEGOTIABLE']),
  duration: z.number().positive().optional(),
  availability: z.enum([
    'WEEKDAYS',
    'WEEKENDS', 
    'MORNINGS',
    'EVENINGS',
    'FLEXIBLE',
  ]),
})

// Booking validation
const bookingSchema = z.object({
  serviceId: z.number().positive(),
  scheduledAt: z.date().min(new Date(Date.now() + 2 * 60 * 60 * 1000)), // at least 2 hours from now
  notes: z.string().max(500).optional(),
})

// Contractor application validation
const contractorApplicationSchema = z.object({
  description: z.string().min(10).max(2000),
  categories: z.string().min(1),
  experience: z.string().optional(),
  portfolio: z.string().optional(),
  priceRange: z.string().optional(),
})
```

### Composables & Utilities

```typescript
// composables/useServices.ts - service management
// composables/useBookings.ts - booking management  
// composables/useAuth.ts - authentication state
// composables/useNotifications.ts - notification system
// composables/useDateFormat.ts - date formatting utilities

// utils/priceFormatter.ts - price formatting
// utils/dateTimeUtils.ts - date and time utilities
// utils/availabilityUtils.ts - availability logic
// utils/slotCalculation.ts - time slot calculations
```

### Performance Optimizations

```sql
-- Database indexes for performance
CREATE INDEX idx_service_category ON service(category);
CREATE INDEX idx_service_active ON service(isActive);
CREATE INDEX idx_service_price ON service(price);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_scheduled ON booking(scheduledAt);
CREATE INDEX idx_contractor_status ON contractor(status);
CREATE INDEX idx_contractor_availability_day ON contractor_availability(dayOfWeek);
```

### Error Handling Patterns

```typescript
// API Error Handling
try {
  const validatedData = schema.parse(body)
  // Logic...
} catch (error) {
  if (error instanceof z.ZodError) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input data',
      data: error.errors,
    })
  }
  throw error
}

// Frontend Error Handling
const { data, error, pending } = await $fetch('/api/endpoint', {
  onError: (error) => {
    notifications.error('Operation Failed', error.message)
  }
})
```

## 12. Testing & Quality Assurance

### Testing Strategy
**Mandatory Playwright MCP Testing** for all UI and E2E testing

### Testing Approach
1. **Test-First Development**: Always test existing functionality before building new features
2. **Real Browser Testing**: Use Playwright MCP for comprehensive testing
3. **Issue Documentation**: Create GitHub issues for bugs found during testing
4. **Iterative Development**: Fix issues as discovered, test each fix

### Unit Tests
- Service and booking data validation
- Status and access rights business logic
- Formatting and calculation utilities
- Zod schema validation testing

### API Tests
- Service CRUD operations
- Booking process and validation
- Access rights and authorization
- Search and filtering functionality
- Calendar integration endpoints

### E2E Tests with Playwright MCP
- Service creation by contractor workflow
- Service search and booking by client workflow
- Booking status management across user types
- Different user roles and permissions
- Calendar interaction and booking management

### Playwright MCP Testing Features
- **Real Browser Interaction**: Complete user workflow testing
- **Visual Feedback**: Screenshots and visual validation
- **Network Monitoring**: Request/response analysis
- **Console Capture**: Error detection and debugging
- **Cross-Platform**: Testing across different browsers

### Quality Metrics
- **Booking Success Rate**: Track successful booking completions
- **User Experience**: Page load times and interaction responsiveness
- **Error Rates**: Monitor and reduce API and UI errors
- **System Reliability**: Uptime and performance monitoring

---

## � Documentation & Development

### Development Workflow
1. **Test-First Approach**: Always test existing functionality before new features
2. **Playwright MCP Testing**: Mandatory for all UI and E2E scenarios
3. **GitHub Issues**: Document and track all bugs and enhancements
4. **Iterative Development**: Small incremental changes with proper testing

### Branch Strategy
- `main` - Production-ready code
- `feature/stage-*` - Development branches for new features
- Proper PR reviews and testing before merge

### Code Standards
- **TypeScript**: Strict typing for all components and APIs
- **English Language**: All code, comments, and documentation in English
- **Error Handling**: Comprehensive error handling with user feedback
- **Performance**: Database indexes and query optimization

### GitHub CLI Workflow
```bash
# Create issues
gh issue create --title "🚀 Feature Name" --body "Description" --label "enhancement"

# Create PRs with detailed body
gh pr create --title "✅ Feature Complete" --body-file pr-body.md --base main
```

---

*Last Updated: August 4, 2025*
*Current Status: Stage 7 Completed, Stage 8 Planning*
*Branch: feature/stage-7-calendar-integration*
