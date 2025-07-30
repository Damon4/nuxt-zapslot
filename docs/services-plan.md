
# Services Feature Implementation Plan

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

  status      String   @default("PENDING") // PENDING, CONFIRMED, CANCELLED, COMPLETED
  scheduledAt DateTime // when the service is scheduled
  duration    Int?     // actual duration (may differ from Service.duration)
  totalPrice  Decimal? // final price (can be negotiable)
  notes       String?  // additional notes from the client

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("booking")
}
```

## 2. API Endpoints

### For Contractors

- `GET /api/contractor/services` - list own services
- `POST /api/contractor/services` - create new service
- `PUT /api/contractor/services/:id` - edit service
- `DELETE /api/contractor/services/:id` - delete service
- `PATCH /api/contractor/services/:id/toggle` - enable/disable service

### For Clients

- `GET /api/services/search` - search and filter services (public)
- `GET /api/services/:id` - service details (public)
- `POST /api/services/:id/book` - book a service
- `GET /api/user/bookings` - my bookings
- `PATCH /api/user/bookings/:id/cancel` - cancel booking


### For Contractors (booking management)

- `GET /api/contractor/bookings` - incoming bookings
- `PATCH /api/contractor/bookings/:id/status` - change booking status (confirm/cancel)


### For Admins

- `GET /api/admin/services` - all services with filters
- `GET /api/admin/bookings` - all bookings with filters


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

- Only approved contractors can create services
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

- `PENDING` - waiting for contractor confirmation
- `CONFIRMED` - confirmed by contractor
- `CANCELLED` - cancelled (by client or contractor)
- `COMPLETED` - service completed


## 5. Access Rights and Middleware

### Middleware

- `contractor-required.ts` - check contractor status
- `service-owner.ts` - check service owner
- `booking-participant.ts` - check booking participant

### Access Rights

- Create services: only approved contractors
- Edit services: only owner
- View services: all users
- Booking: only authorized clients
- Manage bookings: service owner or client

## 6. Notifications


### Toast Notifications

- Service created/updated/deleted
- Booking sent/confirmed/cancelled
- New incoming booking (for contractor)


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
- `sortBy` - sorting (price, createdAt, rating)
- `page`, `limit` - pagination


### Performance Indexes

```sql
CREATE INDEX idx_service_category ON service(category);
CREATE INDEX idx_service_active ON service(isActive);
CREATE INDEX idx_service_price ON service(price);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_scheduled ON booking(scheduledAt);
```


## Current Implementation Status

### ✅ Completed Infrastructure
- PostgreSQL database with User and Contractor models
- Authentication system with GitHub OAuth
- Admin interface for contractor approval
- Profile management for users and contractors
- Middleware for access control

### ✅ Completed Stages

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

### 📋 Current Stage

**Stage 7: Calendar Integration ⏳ IN PROGRESS**
- ✅ Visual calendar component for booking management (FullCalendar integration)
- ✅ Interactive date/time selection interface (Month/Week/Day views)
- ✅ Calendar-based booking overview (Statistics dashboard)
- ✅ Calendar foundation with responsive design and TypeScript
- 🔄 Availability scheduling and time slot management (Basic modal)
- 🔄 Drag-and-drop scheduling interface (Foundation ready)
- 🔄 Time conflict detection (API endpoints prepared)

**Stage 8: Review & Rating System**
- Review submission after completed services
- Star rating system (1-5 stars)
- Review display on service and contractor pages
- Rating aggregation and averages
- Review moderation system

**Stage 9: Advanced Search & Analytics**
- **Advanced filtering and search capabilities**
  - Complete price range filters (min/max)
  - Availability filters (weekdays, weekends, mornings, evenings)
  - Geographic location-based search
  - Contractor rating and review count filters
  - Advanced search with autocomplete
- **Analytics dashboard**
  - Contractor dashboard with booking analytics
  - Revenue tracking and reporting
  - Service performance metrics
  - Client booking patterns analysis
  - Monthly/yearly statistics

### 🔮 Future Stages
- Email notification system for booking updates
- Real-time notifications (WebSocket/SSE implementation)
- Payment integration
- Performance optimizations and caching strategies
- Mobile app notifications



## 8. Implementation Roadmap

### Stage 1: Core Models and API ✅ READY

1. Add Service and Booking models to Prisma
2. Database migration
3. Create basic API endpoints for CRUD operations
4. Middleware for access rights check

### Stage 2: Contractor Interface ⏳ PLANNED

1. Service management page
2. Service create/edit form
3. Bookings management page
4. Integration with existing contractor profile

### Stage 3: Public Service Catalog ⏳ PLANNED

1. Service search and filter page
2. Service detail page
3. Booking form
4. Integration with contractor profiles

### Stage 4: Client Booking Management ✅ COMPLETED

1. ✅ "My Bookings" page for clients (`/my-bookings`)
   - Full booking management interface with filtering and sorting
   - Statistics display (Total, Pending, Confirmed, Completed, Cancelled)
   - BookingCard component with NuxtTime for SSR-safe dates
   - Breadcrumb navigation from Dashboard

2. ✅ Dashboard integration
   - Restored "My Bookings" preview section with ClientBookingsPreview
   - Shows recent bookings with statistics
   - "View All Bookings" link to full page

3. ✅ Technical implementation
   - BookingCard component shows status badges
   - Proper status handling (Pending, Confirmed, Completed, Cancelled)
   - Unified "bookings" terminology across all interfaces
   - Replaced ClientOnly with NuxtTime for hydration-safe dates
   - Russian localization for relative dates
   - Contractor booking interface at `/contractor/bookings`
   - All technical issues resolved (hydration, icons)

### Stage 5: Booking Details and Actions ⏳ IN PROGRESS

1. ✅ Individual booking detail pages (`/my-bookings/[id]`)
   - Complete booking detail interface with service information
   - Contractor details and contact information
   - Booking timeline and status history
   - Action buttons (Cancel, Contact, View Details)
   - Cancellation confirmation modal with policies
   - Real-time status updates and notifications

2. ✅ Enhanced booking cancellation functionality
   - Time-based cancellation policies (2-hour minimum)
   - Server-side validation for cancellation eligibility
   - Improved error handling and user feedback
   - Cancellation confirmation modal

3. ✅ Enhanced notifications system
   - Advanced toast notifications for all booking actions
   - Detailed status change notifications
   - Better error messages and user guidance
   - Success confirmations for all operations

4. ✅ Contractor booking management improvements
   - Advanced booking table with selection capabilities
   - Bulk actions for multiple bookings (Confirm All, Cancel All, Complete All)
   - Enhanced filtering and sorting options
   - Real-time status updates with better UX
   - Improved booking statistics and overview

### Completed Features in Stage 5:
- ✅ Individual booking detail pages with full information
- ✅ Enhanced cancellation system with time-based policies
- ✅ Bulk actions for contractor booking management
- ✅ Advanced table interface with selection capabilities
- ✅ Improved notification system
- ✅ Better error handling and user feedback

### Stage 6: Service Management (Contractors) ✅ COMPLETED

1. ✅ Service creation and management
   - "My Services" page (`/contractor/services`) - Full CRUD interface
   - Service create/edit forms - Advanced validation and UX
   - Service activation/deactivation - Toggle functionality
   - Service statistics and analytics - Real-time booking counts

2. ✅ Service discovery and booking flow
   - Public service catalog (`/services`) - Search, filters, pagination
   - Service search and filtering - Category, price, availability filters
   - Service detail pages (`/services/[id]`) - Complete contractor and service info
   - Booking form integration - Date/time selection with validation

### Stage 7: Calendar Integration ⏳ IN PROGRESS

1. ✅ **Calendar interface foundation**
   - FullCalendar Vue 3 integration with TypeScript
   - Month/Week/Day view switching functionality
   - Calendar statistics dashboard (Today's Bookings, This Week, Available Slots, Revenue)
   - Responsive design with DaisyUI theme integration
   - Calendar page at `/contractor/calendar` with proper middleware protection

2. 🔄 **Advanced calendar features** (In Development)
   - Interactive booking visualization on calendar
   - Drag-and-drop scheduling interface
   - Available time slots highlighting
   - Quick booking creation from calendar slots
   - Time conflict detection system

### Stage 8: Review & Rating System

1. Post-service review functionality
   - Review submission forms for completed bookings
   - Star rating system (1-5 stars)
   - Written feedback collection
   - Photo upload support for reviews

2. Review display and aggregation
   - Service page review sections
   - Contractor profile rating averages
   - Review filtering and sorting
   - Review moderation tools

### Stage 9: Advanced Search & Analytics

1. **Advanced filtering and search**
   - Complete price range implementation (min/max in UI)
   - Availability filters in search interface
   - Geographic location-based search
   - Contractor rating and review count filters
   - Search autocomplete and suggestions
   - Saved search functionality

2. **Analytics dashboard**
   - Contractor analytics dashboard
   - Booking statistics and trends
   - Revenue tracking and projections
   - Service performance metrics
   - Client retention analysis
   - Monthly/yearly performance reports
   - Booking pattern analysis
   - Peak time identification
   - Pricing optimization suggestions

## Known Issues & Technical Debt

### Stage 5 Completed ✅
- ✅ Individual booking detail pages implemented (`/my-bookings/[id]`)
- ✅ Enhanced booking cancellation functionality with time-based policies
- ✅ Advanced notifications system for all booking actions
- ✅ Contractor bulk actions for booking management
- ✅ Improved table interface with selection capabilities

### Remaining Tasks (Next Stages)
- Calendar view integration for contractors
- Real-time notifications (WebSocket/SSE implementation)
- Email notification system
- Review and rating system after completed bookings

### Future Improvements
- Advanced scheduling calendar component
- Automated booking reminders
- Payment integration
- Advanced analytics and reporting
- Mobile app notifications

## 9. Technical Details

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
```

### Composables

- `useServices.ts` - service management
- `useBookings.ts` - booking management
- `useServiceSearch.ts` - service search and filtering

### Utilities

- `priceFormatter.ts` - price formatting
- `dateTimeUtils.ts` - date and time utilities
- `availabilityUtils.ts` - availability logic

## 10. Testing

### Unit Tests

- Service and booking data validation
- Status and access rights business logic
- Formatting and calculation utilities

### API Tests

- Service CRUD operations
- Booking process
- Access rights and authorization
- Search and filtering

### E2E Tests

- Service creation by contractor
- Service search and booking by client
- Booking status management
- Different user roles
