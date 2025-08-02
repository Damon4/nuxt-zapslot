# Contractor Schedule & Slot Management - Implementation Plan

## 🎯 Overview

This feature implements flexible configuration of contractor working slots based on individual schedules. The system calculates and displays real-time availability, integrates with the calendar, and provides accurate slot statistics for optimal booking management.

## 🎯 Goals

- Enable contractors to configure personalized work schedules
- Calculate accurate available slots based on schedule and bookings
- Integrate schedule data with calendar visualization
- Provide real-time slot statistics and availability tracking

## 🏗️ Architecture Overview

### Core Components

1. **ScheduleManager.vue** — comprehensive schedule management interface
2. **ScheduleForm.vue** — schedule configuration form with validation
3. **SlotCalculator.vue** — real-time slot calculation and display
4. **AvailabilityStats.vue** — detailed statistics dashboard
5. **CalendarView.vue** — enhanced calendar with schedule integration

### Schedule Features

- **Flexible Working Hours**: Configure daily start/end times
- **Custom Work Days**: Select specific days of the week
- **Slot Duration Control**: Set standard slot lengths
- **Break Management**: Configure breaks and buffer times
- **Real-time Calculation**: Dynamic slot availability computation
- **Calendar Integration**: Seamless integration with booking calendar

### Business Logic

- **Conflict Detection**: Prevent overlapping bookings
- **Automatic Recalculation**: Update slots when schedule changes
- **Buffer Time Support**: Configurable gaps between bookings
- **Holiday Management**: Account for non-working periods

---

## 📋 Technical Requirements

### New Dependencies

```json
{
  "date-fns": "^3.2.0"
}
```

### Database Extensions

```prisma
model ContractorSchedule {
  id           Int      @id @default(autoincrement())
  contractorId Int      @unique
  contractor   Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  // Working days configuration (JSON array of day numbers)
  workingDays  String   // JSON: [1,2,3,4,5] (Monday-Friday)
  
  // Daily time configuration
  startTime    String   // HH:mm format (e.g., "09:00")
  endTime      String   // HH:mm format (e.g., "18:00")
  
  // Slot configuration
  slotDuration Int      // Duration in minutes (e.g., 30)
  bufferTime   Int      @default(0) // Buffer between slots in minutes
  
  // Break periods (JSON array of break objects)
  breaks       String?  // JSON: [{"start": "12:00", "end": "13:00", "days": [1,2,3,4,5]}]
  
  // Settings
  isActive     Boolean  @default(true)
  timezone     String   @default("UTC")
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("contractor_schedule")
}

model ScheduleException {
  id           Int      @id @default(autoincrement())
  contractorId Int
  contractor   Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  date         DateTime @db.Date
  type         String   // UNAVAILABLE, CUSTOM_HOURS, HOLIDAY
  startTime    String?  // For CUSTOM_HOURS
  endTime      String?  // For CUSTOM_HOURS
  reason       String?  // Description of exception
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([contractorId, date])
  @@map("schedule_exception")
}
```

---

## 🔧 Implementation Steps

### Phase 1: Backend Foundation

1. **Database Schema Setup**
   - Create ContractorSchedule model with comprehensive fields
   - Add ScheduleException model for holidays/custom hours
   - Implement proper relationships and constraints

2. **Core API Development**
   - `GET /api/contractor/schedule` — retrieve current schedule
   - `POST /api/contractor/schedule` — create/update schedule
   - `PUT /api/contractor/schedule` — full schedule replacement
   - `DELETE /api/contractor/schedule` — reset to default schedule

3. **Schedule Validation Logic**
   - Validate time formats and ranges
   - Ensure working days are valid
   - Prevent invalid slot configurations

### Phase 2: Slot Calculation Engine

1. **Core Calculation Service**
   - Implement slot generation algorithm
   - Handle working days and time ranges
   - Apply break periods and buffer times

2. **Availability Checking**
   - Check against existing bookings
   - Handle schedule exceptions
   - Calculate real-time availability

3. **Performance Optimization**
   - Cache calculated slots for performance
   - Implement efficient booking conflict detection
   - Optimize database queries

### Phase 3: Frontend Implementation

1. **Schedule Management UI**
   - Create intuitive schedule configuration form
   - Implement real-time preview of changes
   - Add validation and error handling

2. **Calendar Integration**
   - Update CalendarView to use schedule data
   - Display calculated slots visually
   - Show availability statistics

3. **Statistics Dashboard**
   - Real-time slot availability metrics
   - Weekly/monthly utilization rates
   - Booking efficiency analytics

### Phase 4: Integration & Polish

1. **Cross-Feature Integration**
   - Integrate with booking system
   - Update notification systems
   - Ensure data consistency

2. **User Experience Refinement**
   - Mobile-responsive schedule editing
   - Quick schedule templates
   - Import/export functionality

3. **Testing & Optimization**
   - Comprehensive test coverage
   - Performance benchmarking
   - User acceptance testing

---

## 🎨 UI/UX Design

### Schedule Configuration Interface

- **Day Selection**: Interactive weekly calendar for selecting working days
- **Time Pickers**: User-friendly time selection with validation
- **Slot Duration**: Slider or dropdown for duration selection
- **Break Management**: Add/remove breaks with drag-and-drop interface
- **Preview Mode**: Real-time preview of schedule changes

### Calendar Integration

- **Slot Visualization**: Color-coded slots (available/booked/blocked)
- **Availability Overlay**: Visual indicators on calendar grid
- **Quick Actions**: Fast schedule adjustments from calendar
- **Conflict Indicators**: Clear warnings for scheduling conflicts

### Statistics Dashboard

- **Utilization Metrics**: Percentage of slots filled
- **Availability Summary**: Quick overview of free slots
- **Trend Analysis**: Historical booking patterns
- **Efficiency Indicators**: Revenue per slot metrics

### Color Coding System

- **🟢 Available**: Green - Open slots ready for booking
- **🟡 Partially Available**: Yellow - Some slots available
- **🔴 Fully Booked**: Red - No slots available
- **🔵 Break Time**: Blue - Scheduled breaks
- **⚫ Non-Working**: Gray - Outside working hours

---

## 🔌 API Endpoints

### Schedule Management

- `GET /api/contractor/schedule` — Get current schedule configuration
- `POST /api/contractor/schedule` — Create or update schedule
- `PUT /api/contractor/schedule` — Replace entire schedule
- `DELETE /api/contractor/schedule` — Reset to default schedule

### Slot Availability

- `GET /api/contractor/calendar/slots` — Get available slots for date range
- `GET /api/contractor/calendar/availability/:date` — Check specific date availability
- `POST /api/contractor/calendar/calculate-slots` — Force recalculation of slots

### Schedule Exceptions

- `GET /api/contractor/schedule/exceptions` — Get schedule exceptions
- `POST /api/contractor/schedule/exceptions` — Add schedule exception
- `PUT /api/contractor/schedule/exceptions/:id` — Update exception
- `DELETE /api/contractor/schedule/exceptions/:id` — Remove exception

### Analytics

- `GET /api/contractor/schedule/stats` — Get utilization statistics
- `GET /api/contractor/schedule/efficiency` — Get efficiency metrics

---

## 🧪 Testing Strategy

### Unit Tests

- **Schedule Validation**: Test schedule configuration validation
- **Slot Calculation**: Test slot generation algorithms
- **Conflict Detection**: Test booking conflict identification
- **Time Zone Handling**: Test timezone conversion accuracy
- **API Endpoints**: Test all CRUD operations for schedules

### Integration Tests

- **Schedule-Calendar Integration**: Test schedule data flow to calendar
- **Booking-Schedule Sync**: Test real-time availability updates
- **Statistics Accuracy**: Test metrics calculation correctness
- **Exception Handling**: Test schedule exception processing

### E2E Tests

- **Complete Schedule Setup**: Full contractor schedule configuration
- **Slot Booking Flow**: End-to-end booking on calculated slots
- **Schedule Modification**: Test live schedule updates
- **Mobile Responsiveness**: Test on various device sizes

### Performance Tests

- **Slot Calculation Speed**: Benchmark calculation performance
- **Database Query Optimization**: Test query efficiency
- **Cache Effectiveness**: Test caching mechanisms
- **Load Testing**: Test with multiple concurrent users

---

## 📁 File Structure

```
components/
├── schedule/
│   ├── ScheduleManager.vue           # Main schedule management interface
│   ├── ScheduleForm.vue              # Schedule configuration form
│   ├── SlotCalculator.vue            # Slot calculation display
│   ├── AvailabilityStats.vue         # Statistics dashboard
│   ├── BreakManager.vue              # Break time configuration
│   └── SchedulePreview.vue           # Visual schedule preview
├── calendar/
│   ├── CalendarView.vue              # Enhanced calendar with schedule
│   ├── SlotVisualization.vue         # Slot availability overlay
│   └── AvailabilityIndicator.vue     # Quick availability status
├── forms/
│   ├── TimePickerForm.vue            # Time selection component
│   ├── DaySelector.vue               # Working days selection
│   └── ExceptionForm.vue             # Schedule exception form
└── modals/
    ├── ScheduleSetupModal.vue        # Initial schedule setup
    └── QuickScheduleModal.vue        # Fast schedule adjustments

pages/
├── contractor/
│   ├── schedule.vue                  # Main schedule management page
│   ├── availability.vue              # Availability overview
│   └── analytics.vue                # Schedule analytics

server/api/contractor/
├── schedule/
│   ├── index.get.ts                  # Get current schedule
│   ├── index.post.ts                 # Create/update schedule
│   ├── index.put.ts                  # Replace schedule
│   ├── index.delete.ts               # Reset schedule
│   ├── exceptions.get.ts             # Get exceptions
│   ├── exceptions.post.ts            # Add exception
│   ├── stats.get.ts                  # Get statistics
│   └── efficiency.get.ts             # Get efficiency metrics
└── calendar/
    ├── slots.get.ts                  # Get available slots
    ├── availability.get.ts           # Check date availability
    └── calculate-slots.post.ts       # Force slot recalculation

composables/
├── useSchedule.ts                    # Schedule state management
├── useSlotCalculation.ts             # Slot calculation logic
├── useAvailability.ts                # Availability checking
├── useScheduleExceptions.ts          # Exception management
└── useScheduleStats.ts               # Statistics calculations

utils/
├── schedule-helpers.ts               # Schedule utility functions
├── slot-calculator.ts                # Core slot calculation logic
├── time-utils.ts                     # Time manipulation utilities
├── availability-checker.ts           # Availability validation
└── schedule-validator.ts             # Schedule validation logic

types/
├── schedule.types.ts                 # Schedule TypeScript definitions
└── availability.types.ts             # Availability type definitions
```

---

## 📈 Success Metrics

### User Experience Metrics

- **Schedule Setup Time**: Average time to configure initial schedule
- **Schedule Modification Frequency**: How often contractors adjust schedules
- **User Satisfaction**: Survey scores for schedule management ease
- **Feature Adoption Rate**: Percentage using advanced scheduling features

### Business Performance Metrics

- **Slot Utilization Rate**: Percentage of available slots that get booked
- **Booking Conversion Rate**: Available slots converted to confirmed bookings
- **Revenue per Available Slot**: Average revenue generated per slot
- **Schedule Optimization Impact**: Improvement in booking efficiency

### System Performance Metrics

- **Slot Calculation Speed**: Time to calculate available slots
- **Real-time Update Latency**: Delay in availability updates
- **API Response Times**: Schedule-related endpoint performance
- **Cache Hit Ratio**: Effectiveness of slot calculation caching

### Contractor Efficiency Metrics

- **Schedule Adherence**: How well contractors stick to their schedules
- **Break Utilization**: Usage of configured break periods
- **Exception Frequency**: How often schedule exceptions are needed
- **Calendar Integration Usage**: Adoption of calendar-based scheduling

## 🔄 Migration & Rollout

### Phase 1: Foundation (Week 1-2)
- Database schema implementation
- Core API development
- Basic schedule validation

### Phase 2: Core Features (Week 3-4)
- Schedule management UI
- Slot calculation engine
- Calendar integration

### Phase 3: Advanced Features (Week 5-6)
- Exception handling
- Statistics dashboard
- Performance optimization

### Phase 4: Polish & Launch (Week 7-8)
- User testing and feedback
- Bug fixes and refinements
- Production deployment

## 🎯 Future Enhancements

### Smart Scheduling
- AI-powered schedule optimization
- Automatic slot adjustment based on demand
- Predictive availability recommendations

### Advanced Analytics
- Detailed utilization reports
- Seasonal pattern analysis
- Revenue optimization insights

### Integration Expansions
- Third-party calendar sync (Google, Outlook)
- External booking platform integration
- Mobile app native scheduling
