# Contractor System - Quick Guide

## Overview
The contractor functionality allows users to apply for service provider status with **automatic approval**. The system includes contractor profile management, service creation, and complete profile deletion capabilities.

## System Features
- **Auto-Approval**: All contractor applications are automatically approved
- **Profile Management**: Complete contractor profile editing capabilities  
- **Service Management**: Create, edit, and manage services
- **Profile Deletion**: Permanent profile removal with cascading service deletion
- **Booking Management**: Handle incoming service bookings

## Components

### 1. ContractorProfileBlock.vue
The main block for displaying and managing contractor status in the user profile.

**Features:**
- Display the current contractor status (active or suspended)  
- Submit a new application via a modal window (auto-approved)
- Edit contractor profile (for active contractors)
- **Delete contractor profile** with service removal confirmation
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
Submit an application for contractor status (automatically approved).

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

**Response:** Immediate approval with contractor profile data.

### POST /api/contractor/delete
Delete contractor profile and all associated services.

**Response:**
```json
{
  "success": true,
  "deletedServices": 5
}
```

### PUT /api/contractor/profile
Update the contractor profile.

**Request Body:** (similar to POST /api/contractor/apply)

## Contractor Statuses

- **1**: Active contractor (default for new applications)
- **3**: Suspended contractor (admin action only)

**Note**: The system uses automatic approval - all applications immediately receive status 1 (Active).

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

1. **Enhanced Calendar Integration**: Advanced calendar features with drag-and-drop
2. **Review & Rating System**: Client feedback and contractor ratings  
3. **Advanced Analytics**: Contractor performance dashboards
4. **Payment Integration**: Direct payment processing for services
5. **Mobile App**: Native mobile application for contractors
