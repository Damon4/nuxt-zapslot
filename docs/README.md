# ZapSlot Documentation

## System Overview

ZapSlot is a comprehensive service booking platform with immediate booking confirmation and real-time availability management.

## Key Features

### 🚀 Immediate Booking Confirmation
- All service bookings are confirmed instantly
- No waiting for contractor approval
- Real-time slot availability updates

### 👥 User Roles
- **Clients**: Browse services, make bookings, manage appointments
- **Contractors**: Offer services, manage availability, handle bookings
- **Admins**: Moderate contractors, system oversight

### 📅 Booking System
- **Status Flow**: CONFIRMED → COMPLETED/CANCELLED
- **Advance Booking**: Minimum 2 hours in advance
- **Conflict Prevention**: Automatic double-booking prevention
- **Self-booking Protection**: Users cannot book their own services

## Documentation Index

- [`booking-status-update.md`](./booking-status-update.md) - Booking system overview
- [`services-plan.md`](./services-plan.md) - Services and booking technical plan
- [`contractor-plan.md`](./contractor-plan.md) - Contractor management system
- [`stage-*.md`](.) - Development stage completion reports

## Quick Start

1. **For Clients**: Browse `/services` → Select service → Book immediately
2. **For Contractors**: Apply via `/contractor/apply` → Manage services at `/contractor/services`
3. **For Admins**: Moderate contractors at `/admin/contractors`

## API Endpoints

### Booking
- `POST /api/services/[id]/book` - Create immediate confirmed booking
- `GET /api/services/[id]/available-slots` - Get real-time availability

### Services
- `GET /api/services` - Public service directory
- `POST /api/contractor/services` - Create service (contractors only)

### Authentication
- All protected routes use Better Auth with GitHub OAuth
- Session-based authentication with role-based access

## Technical Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript, TailwindCSS, DaisyUI
- **Backend**: Nuxt Server API, Prisma ORM, PostgreSQL
- **Authentication**: Better Auth with GitHub OAuth
- **Testing**: Playwright MCP for comprehensive browser testing
