# Contractor System - Quick Guide

## Overview
The contractor functionality allows users to apply for service provider status. The system includes moderation by administrators and integration into the user profile.

## Components

### 1. ContractorProfileBlock.vue
The main block for displaying and managing contractor status in the user profile.

**Features:**
- Display the current application status (pending, approved, rejected)
- Submit a new application via a modal window
- Edit contractor profile (for approved contractors)
- Automatic data loading on mount

### 2. ContractorApplicationModal.vue
Modal window for applying for contractor status.

**Form Fields:**
- Service description (required, minimum 10 characters)
- Service category (selection from a predefined list)
- Work experience (optional)
- Portfolio (optional, link or description)
- Service cost (optional)
- Agreement to terms (required)

### 3. ContractorEditModal.vue
Modal window for editing the contractor profile.

**Functions:**
- Pre-filling the form with current data
- Validation of required fields
- Saving changes via API

## API Endpoints

### GET /api/contractor/profile
Retrieve the contractor profile data of the current user.

**Response:**
```json
{
  "data": {
    "id": 1,
    "userId": "user_123",
    "description": "Service description",
    "categories": "Repair and construction",
    "experience": "5 years of experience",
    "portfolio": "https://example.com",
    "price": "from 1000 RUB/hour",
    "status": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/contractor/apply
Submit an application for contractor status.

**Request Body:**
```json
{
  "description": "Service description",
  "categories": "Category",
  "experience": "Work experience (optional)",
  "portfolio": "Portfolio (optional)",
  "price": "Cost (optional)"
}
```

### PUT /api/contractor/profile
Update the contractor profile.

**Request Body:** (similar to POST /api/contractor/apply)

## Contractor Statuses

- **0**: Application submitted, awaiting moderation
- **1**: Application approved, contractor is active
- **-1**: Application rejected

## Service Categories

1. Repair and construction
2. Electrical work
3. Plumbing
4. Cleaning services
5. Computer assistance
6. Design and interior
7. Tutoring and education
8. Beauty and health
9. Auto services
10. Courier services
11. Photo and video
12. Legal services
13. Consulting (business, IT, finance)
14. Minor household repairs
15. Event organization
16. Web development and IT
17. Translation services
18. Equipment repair
19. Logistics and transportation
20. Other

## Integration

The `ContractorProfileBlock` component is already integrated into the `/profile` page. It is automatically displayed for all authorized users.

## Security

- All API endpoints are protected by authentication
- Users can only manage their own contractor profiles
- Data validation on both client and server
- Use of TypeScript for type safety

## Next Steps

1. **Admin Panel**: Create an interface for application moderation
2. **Notifications**: Add a notification system for application statuses
3. **Enhanced Profile**: Add photos, ratings, reviews
4. **Contractor Search**: Public contractor catalog with filtering
