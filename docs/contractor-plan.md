# Contractor Feature Implementation Plan

## 1. Data Model
- Add Contractor table to Prisma:
  - id (Int, PK)
  - userId (Int, relation to User, unique)
  - status (String: pending, approved, rejected)
  - description (String) // required field
  - categories (String or separate table/enum) // required field
  - experience (String, optional)
  - portfolio (String, optional) // text description or external link
  - price (String, optional)
  - createdAt, updatedAt


## 2. API and Business Logic
- POST /api/contractor/apply - apply for Contractor status
- GET /api/contractor/profile - get own Contractor profile
- PUT /api/contractor/profile - edit own Contractor profile
- GET /api/admin/contractors - view all applications (admin only)
- PATCH /api/admin/contractors/:id - moderate application (approve/reject)
- GET /api/contractors/search - search and filter Contractors (public)
- GET /api/contractors/:id - specific contractor profile (public)

## 3. Interface
- "Become a Contractor" button in user profile
- Contractor profile form with fields:
  1. Description — required, textarea
  2. Categories/skills — required, multi-select dropdown
  3. Experience — optional, textarea
  4. Portfolio — optional, text or link
  5. Service price — optional, validated input
  6. Agreement to service terms — required checkbox
- "My Services" page/section for contractors
- Public contractor profile page with "Book" button
- For admin: moderation section with status filters

## 4. Authorization and Access Rights
- Middleware to check user authorization
- Function to check contractor status (isApprovedContractor)
- Middleware to check admin rights
- Contractor block is shown in user profile if status: applied, approved, or rejected
- /admin/contractors - admins only

## 5. Notifications
- Toast notifications in UI:
  - Application for contractor status submitted
  - Application approved/rejected
  - Contractor profile updated

## 6. Documentation and Tests
- API documentation:
  - Description of all endpoints with request/response examples
  - Data validation schemas
  - Error codes and handling
- Tests:
  - Unit tests for business logic
  - Integration tests for API
  - E2E tests for user scenarios
  - Access rights and authorization tests

## Contractor Categories
1. Repair and Construction
2. Electrical Work
3. Plumbing
4. Cleaning Services
5. Computer Assistance
6. Design and Interior
7. Tutoring and Education
8. Beauty and Health
9. Auto Services
10. Courier Services
11. Photo and Video
12. Legal Services
13. Consulting (Business, IT, Finance)
14. Minor Household Repairs
15. Event Organization
16. Web Development and IT
17. Translation Services
18. Equipment Repair
19. Logistics and Transportation
20. Other

## Availability
- Enum: WEEKDAYS, WEEKENDS, MORNINGS, EVENINGS, FLEXIBLE
- In the form — dropdown with these options
