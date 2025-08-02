# ZapSlot API Documentation

## Overview

ZapSlot provides a comprehensive REST API for managing appointments, services, and contractor relationships. All endpoints follow RESTful conventions and return JSON responses.

## Authentication

Most endpoints require authentication. The system uses session-based authentication with HTTP-only cookies.

### Authentication Headers
- Session-based authentication (automatically handled by the browser)
- CSRF protection built-in

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "data": { /* optional error details */ }
}
```

## Endpoint Groups

### 🔐 Authentication Endpoints

#### `POST /api/auth/signin`
Initiate GitHub OAuth sign-in process.

#### `POST /api/auth/signout`
Sign out the current user.

#### `GET /api/auth/get-session`
Get current user session information.

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://avatars.githubusercontent.com/u/123456",
    "isContractor": true
  }
}
```

### 👤 User Management

#### `GET /api/user/profile`
Get current user's profile information.

**Auth Required:** Yes

#### `PATCH /api/user/profile`
Update user profile information.

**Auth Required:** Yes  
**Body:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "location": "New Location"
}
```

### 🔧 Contractor Management

#### `POST /api/contractor/apply`
Submit contractor application.

**Auth Required:** Yes  
**Body:**
```json
{
  "categories": "Programming, Web Development",
  "description": "Experienced developer...",
  "price": "$50/hour",
  "portfolio": "https://myportfolio.com"
}
```

#### `GET /api/contractor/profile`
Get contractor profile information.

**Auth Required:** Yes (Contractor only)

#### `PUT /api/contractor/profile`
Update contractor profile.

**Auth Required:** Yes (Contractor only)

### 🛠️ Service Management

#### `GET /api/contractor/services`
Get contractor's services with optional filtering.

**Auth Required:** Yes (Contractor only)  
**Query Parameters:**
- `search` - Search in title/description
- `category` - Filter by category
- `status` - Filter by status (ACTIVE, INACTIVE)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "services": [
    {
      "id": 1,
      "title": "Web Development",
      "description": "Custom website development",
      "category": "Programming",
      "price": "150",
      "priceType": "FIXED",
      "duration": 120,
      "status": "ACTIVE",
      "bookingsCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### `POST /api/contractor/services`
Create a new service.

**Auth Required:** Yes (Contractor only)  
**Body:**
```json
{
  "title": "Service Title",
  "description": "Service description",
  "category": "Web Development",
  "price": "150",
  "priceType": "FIXED",
  "duration": 120,
  "availability": "FLEXIBLE"
}
```

#### `PUT /api/contractor/services/[id]`
Update existing service.

**Auth Required:** Yes (Contractor only)

#### `DELETE /api/contractor/services/[id]`
Delete a service.

**Auth Required:** Yes (Contractor only)

#### `PATCH /api/contractor/services/[id]/status`
Toggle service active/inactive status.

**Auth Required:** Yes (Contractor only)

### 🌐 Public Service Discovery

#### `GET /api/contractors`
Search contractors with filtering.

**Query Parameters:**
- `search` - Search in name/categories/description
- `category` - Filter by service category
- `page` - Page number
- `limit` - Items per page

#### `GET /api/contractors/[id]`
Get public contractor profile.

#### `GET /api/contractors/categories`
Get available service categories.

**Response:**
```json
{
  "categories": [
    "Repair and Construction",
    "Electrical Work",
    "Plumbing",
    "Cleaning Services",
    // ... more categories
  ]
}
```

#### `GET /api/services/[id]`
Get detailed service information.

**Response:**
```json
{
  "service": {
    "id": 1,
    "title": "Web Development",
    "description": "Custom website development",
    "category": "Programming",
    "price": "150",
    "priceType": "FIXED",
    "duration": 120,
    "availability": "FLEXIBLE",
    "contractor": {
      "id": 1,
      "categories": "Programming, Web Development",
      "description": "Experienced developer",
      "user": {
        "name": "John Doe",
        "image": "https://avatars.github.com/u/123456"
      }
    },
    "bookingsCount": 5
  }
}
```

#### `GET /api/services/[id]/available-slots`
Get available booking time slots for a service.

**Response:**
```json
{
  "availableSlots": [
    {
      "date": "2025-08-03",
      "time": "09:00",
      "datetime": "2025-08-03T09:00:00.000Z"
    },
    {
      "date": "2025-08-03", 
      "time": "10:00",
      "datetime": "2025-08-03T10:00:00.000Z"
    }
  ],
  "nextAvailableSlot": {
    "date": "2025-08-03",
    "time": "09:00", 
    "datetime": "2025-08-03T09:00:00.000Z"
  }
}
```

### 📅 Booking Management

#### `POST /api/services/[id]/book`
Create a new booking.

**Auth Required:** Yes  
**Body:**
```json
{
  "scheduledAt": "2025-08-03T09:00:00.000Z",
  "notes": "Additional requirements"
}
```

#### `GET /api/contractor/bookings`
Get contractor's bookings.

**Auth Required:** Yes (Contractor only)  
**Query Parameters:**
- `status` - Filter by booking status
- `date` - Filter by specific date
- `page` - Page number
- `limit` - Items per page

#### `PATCH /api/contractor/bookings/[id]/status`
Update booking status.

**Auth Required:** Yes (Contractor only)  
**Body:**
```json
{
  "status": "CONFIRMED", // PENDING, CONFIRMED, COMPLETED, CANCELLED
  "notes": "Optional status change notes"
}
```

#### `GET /api/user/bookings`
Get user's bookings.

**Auth Required:** Yes

### 👑 Admin Endpoints

#### `GET /api/admin/contractors`
Get all contractors for admin management.

**Auth Required:** Yes (Admin only)  
**Query Parameters:**
- `status` - Filter by contractor status
- `search` - Search contractors
- `page` - Page number
- `limit` - Items per page

#### `PATCH /api/admin/contractors/[id]/status`
Update contractor status (activate/suspend).

**Auth Required:** Yes (Admin only)  
**Body:**
```json
{
  "status": 1 // 1 = Active, 3 = Suspended
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **Booking endpoints**: 30 requests per minute

## Data Validation

All endpoints use Zod schema validation for request bodies. Invalid data will return a 400 error with detailed validation messages.

## Booking System Details

### Slot Generation Algorithm
1. **Working Hours Check**: Verifies contractor availability for each day
2. **Duration Consideration**: Ensures entire service fits within working hours
3. **Conflict Detection**: Checks against existing bookings and blocked time slots
4. **Interval Generation**: Creates 30-minute intervals within available periods

### Booking Status Flow
1. **PENDING** - Initial booking request
2. **CONFIRMED** - Contractor accepts booking
3. **COMPLETED** - Service has been provided
4. **CANCELLED** - Booking cancelled by either party

### Time Zone Handling
All datetime values are stored and transmitted in ISO 8601 UTC format. Frontend components handle local time zone conversion.

## Development Notes

### Request Body Reading Order
**Critical**: When developing API endpoints, always read the request body BEFORE authentication checks:

```typescript
export default defineEventHandler(async (event) => {
  try {
    // ✅ CORRECT: Read body first
    const body = await readBody(event)
    
    // ✅ CORRECT: Then check auth
    const session = await requireAuth(event)
    
    // Process request...
  } catch (error) {
    // Handle errors
  }
})
```

### Testing
Use Playwright MCP for comprehensive API testing:
- Real browser testing for frontend integration
- Network request monitoring
- Form validation testing
- Error handling verification

---

For more detailed implementation examples, see the [GitHub Copilot Instructions](.github/copilot-instructions.md).
