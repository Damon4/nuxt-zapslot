# Stage 7: Calendar Integration - Implementation Plan

## 🎯 Overview
Stage 7 focuses on implementing a comprehensive calendar integration system for contractors to manage their bookings visually and efficiently. This includes interactive calendar views, time slot management, and enhanced booking workflow.

## 🏗️ Architecture Overview

### Core Components
1. **CalendarView.vue** - Main calendar interface component
2. **TimeSlotManager.vue** - Time slot configuration and management
3. **BookingCalendarCard.vue** - Individual booking representation on calendar
4. **AvailabilitySelector.vue** - Contractor availability configuration
5. **CalendarNavigation.vue** - Calendar navigation controls

### Calendar Features
- **Monthly/Weekly Views**: Switch between month and week views
- **Booking Visualization**: Color-coded bookings by status
- **Drag & Drop**: Reschedule bookings with drag-and-drop
- **Time Conflict Detection**: Prevent overlapping bookings
- **Quick Booking Creation**: Click empty slots to create bookings
- **Availability Management**: Set working hours and available days

## 📋 Technical Requirements

### New Dependencies
```json
{
  "@fullcalendar/vue3": "^6.1.10",
  "@fullcalendar/core": "^6.1.10",
  "@fullcalendar/daygrid": "^6.1.10",
  "@fullcalendar/timegrid": "^6.1.10",
  "@fullcalendar/interaction": "^6.1.10",
  "date-fns": "^3.2.0"
}
```

### Database Extensions
```prisma
model ContractorAvailability {
  id           Int      @id @default(autoincrement())
  contractorId Int
  contractor   Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  dayOfWeek    Int      // 0-6 (Sunday to Saturday)
  startTime    String   // HH:mm format
  endTime      String   // HH:mm format
  isAvailable  Boolean  @default(true)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([contractorId, dayOfWeek])
  @@map("contractor_availability")
}

model TimeSlot {
  id           Int      @id @default(autoincrement())
  contractorId Int
  contractor   Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  date         DateTime @db.Date
  startTime    String   // HH:mm format
  endTime      String   // HH:mm format
  isBlocked    Boolean  @default(false)
  reason       String?  // Reason for blocking (vacation, break, etc.)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([contractorId, date, startTime])
  @@map("time_slot")
}
```

## 🔧 Implementation Steps

### Phase 1: Basic Calendar Setup
1. **Install Dependencies**
   - FullCalendar Vue 3 integration
   - Date manipulation utilities

2. **Create Calendar Base Component**
   - Basic monthly view
   - Event rendering from bookings
   - Navigation controls

3. **Integrate with Existing Booking System**
   - Display existing bookings on calendar
   - Color coding by booking status

### Phase 2: Interactive Features
1. **Booking Visualization**
   - Custom event rendering
   - Status-based color coding
   - Hover details and tooltips

2. **Click Interactions**
   - Click empty slots to create bookings
   - Click existing bookings for details
   - Date range selection for availability

3. **Drag & Drop Functionality**
   - Reschedule bookings by dragging
   - Conflict detection and prevention
   - Confirmation dialogs for changes

### Phase 3: Availability Management
1. **Working Hours Configuration**
   - Set daily working hours
   - Configure available days
   - Recurring availability patterns

2. **Time Slot Blocking**
   - Block specific time slots
   - Add reasons for blocking
   - Vacation and break management

3. **Conflict Detection System**
   - Real-time availability checking
   - Prevent double booking
   - Smart scheduling suggestions

## 🎨 UI/UX Design

### Calendar Views
- **Month View**: Overview of all bookings for the month
- **Week View**: Detailed time slots for the week
- **Day View**: Hourly breakdown for intensive days

### Color Coding System
- **🟢 Confirmed**: Green - Confirmed bookings
- **🟡 Pending**: Yellow - Pending confirmations
- **🔴 Blocked**: Red - Unavailable time slots
- **🔵 Available**: Blue - Open time slots
- **⚫ Cancelled**: Gray - Cancelled bookings

### Interactive Elements
- **Hover Effects**: Show booking details on hover
- **Click Actions**: Context menus for bookings
- **Drag Indicators**: Visual feedback during drag operations

## 📊 Calendar Integration Features

### 1. Booking Management
- View all bookings in calendar format
- Quick status updates from calendar
- Bulk actions for selected dates

### 2. Availability Control
- Set working hours per day
- Configure recurring schedules
- Mark vacation/unavailable periods

### 3. Time Slot Management
- Define standard service durations
- Configure buffer times between bookings
- Set maximum bookings per day

### 4. Client Interaction
- Share available time slots with clients
- Real-time booking confirmation
- Automatic calendar updates

## 🔌 API Endpoints

### Calendar Data
- `GET /api/contractor/calendar/bookings` - Get calendar bookings
- `GET /api/contractor/calendar/availability` - Get availability settings
- `POST /api/contractor/calendar/availability` - Set availability
- `PUT /api/contractor/calendar/availability/:id` - Update availability

### Booking Management
- `PATCH /api/contractor/bookings/:id/reschedule` - Reschedule booking
- `POST /api/contractor/calendar/block-time` - Block time slot
- `DELETE /api/contractor/calendar/block-time/:id` - Unblock time slot

### Time Slots
- `GET /api/contractor/calendar/slots` - Get available time slots
- `POST /api/contractor/calendar/slots/generate` - Generate time slots

## 🧪 Testing Strategy

### Unit Tests
- Calendar component rendering
- Date manipulation utilities
- Conflict detection logic
- Availability calculation

### Integration Tests
- Calendar with booking system
- Drag & drop functionality
- API integration tests
- Real-time updates

### E2E Tests
- Complete booking workflow via calendar
- Availability configuration
- Rescheduling operations
- Mobile responsiveness

## 📱 Mobile Considerations

### Responsive Design
- Touch-friendly interactions
- Optimized for mobile screens
- Swipe navigation for dates

### Performance
- Lazy loading for large date ranges
- Efficient re-rendering
- Minimal data fetching

## 🔄 Migration & Rollout

### Phase 1: Backend Setup
- Database migrations
- API endpoint creation
- Core business logic

### Phase 2: Calendar Component
- Calendar UI implementation
- Basic booking display
- Navigation functionality

### Phase 3: Interactive Features
- Drag & drop implementation
- Availability management
- Advanced interactions

### Phase 4: Integration & Testing
- Full system integration
- Performance optimization
- User acceptance testing

## 📈 Success Metrics

### User Experience
- Time spent on booking management
- Contractor satisfaction scores
- Booking workflow efficiency

### System Performance
- Calendar load times
- Real-time update responsiveness
- Mobile performance metrics

### Business Impact
- Booking confirmation rates
- Schedule optimization usage
- Customer satisfaction improvement

## 🎯 Next Phase Preparation

After Stage 7 completion, the calendar system will be ready for:
- **Stage 8**: Review integration on calendar events
- **Stage 9**: Analytics dashboard with calendar data
- **Future**: Advanced scheduling algorithms and AI suggestions

---

## 📁 File Structure

```
components/
├── calendar/
│   ├── CalendarView.vue              # Main calendar component
│   ├── TimeSlotManager.vue           # Time slot management
│   ├── BookingCalendarCard.vue       # Booking representation
│   ├── AvailabilitySelector.vue      # Availability configuration
│   ├── CalendarNavigation.vue        # Calendar controls
│   └── CalendarFilters.vue           # Calendar filters
├── modals/
│   ├── QuickBookingModal.vue         # Quick booking creation
│   ├── RescheduleModal.vue           # Booking rescheduling
│   └── AvailabilityModal.vue         # Availability settings
└── forms/
    ├── TimeSlotForm.vue              # Time slot configuration
    └── ScheduleForm.vue              # Schedule management

pages/
├── contractor/
│   ├── calendar.vue                  # Main calendar page
│   └── schedule.vue                  # Schedule management

server/api/contractor/calendar/
├── bookings.get.ts                   # Calendar bookings
├── availability.get.ts               # Get availability
├── availability.post.ts              # Set availability
├── slots.get.ts                      # Available slots
├── block-time.post.ts                # Block time slot
└── reschedule.patch.ts               # Reschedule booking

composables/
├── useCalendar.ts                    # Calendar state management
├── useAvailability.ts                # Availability management
└── useTimeSlots.ts                   # Time slot utilities

utils/
├── calendar-helpers.ts               # Calendar utilities
├── time-utils.ts                     # Time calculations
└── conflict-detection.ts             # Booking conflicts
```

This comprehensive plan provides a roadmap for implementing a full-featured calendar integration system that will significantly enhance the contractor experience and booking management efficiency.
