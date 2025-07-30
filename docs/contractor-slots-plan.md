# Contractor Slot Management - Implementation Plan

## 🎯 Overview

Flexible configuration of contractor working slots based on an individual schedule. The calendar and statistics display the actual number of available slots for booking.

---

## 🏗️ Architecture Overview

### Core Components

1. **ContractorProfile.vue** — contractor profile with schedule
2. **ScheduleForm.vue** — schedule editing form
3. **CalendarView.vue** — slot and booking display
4. **SlotStats.vue** — available/occupied slot statistics

### Features

- Configure working days and hours
- Slot duration
- Visualization of free and occupied slots
- API for retrieving and updating schedule

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
  contractorId Int
  contractor   Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  daysOfWeek   String   // JSON: [1,2,3,4,5]
  startTime    String   // HH:mm
  endTime      String   // HH:mm
  slotDuration Int      // in minutes
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@unique([contractorId])
  @@map("contractor_schedule")
}
```

---

## 🔧 Implementation Steps

### Phase 1: Backend & Data Model

1. DB migration: ContractorSchedule
2. API endpoints:
   - `GET /api/contractor/schedule` — get schedule
   - `POST /api/contractor/schedule` — create/update schedule

### Phase 2: UI & Frontend

1. ScheduleForm.vue component for editing schedule
2. Integrate schedule into ContractorProfile.vue
3. Retrieve schedule via API

### Phase 3: Calendar Integration

1. Calculate available slots based on schedule and bookings
2. Display slot statistics in SlotStats.vue and CalendarView.vue
3. Visualize free/occupied slots

---

## 🎨 UI/UX Design

- Convenient form for schedule configuration (days of week, time, slot duration)
- Calendar: color indication of free and occupied slots
- Statistics: total slots, occupied, free

---

## 🔌 API Endpoints

- `GET /api/contractor/schedule` — get schedule
- `POST /api/contractor/schedule` — create/update schedule
- `GET /api/contractor/calendar/slots` — get available slots

---

## 🧪 Testing Strategy

### Unit Tests

- Slot calculation by schedule
- API: get/update schedule

### Integration Tests

- Schedule integration with calendar
- Correct statistics display

### E2E Tests

- Full scenario: schedule configuration and slot display

---

## 📁 File Structure

```
components/
├── calendar/
│   ├── CalendarView.vue
│   └── SlotStats.vue
├── forms/
│   └── ScheduleForm.vue
pages/
├── contractor/
│   ├── profile.vue
│   └── schedule.vue
server/api/contractor/
│   ├── schedule.get.ts
│   └── schedule.post.ts
│   └── calendar/slots.get.ts
composables/
├── useSchedule.ts
├── useSlots.ts
utils/
├── slot-helpers.ts
```

---

## 📈 Success Metrics

- Slot fill rate
- Schedule configuration convenience (survey)
- Number of successful bookings

---
