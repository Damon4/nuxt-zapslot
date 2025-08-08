# GitHub Copilot Instructions for ZapSlot Project

## 🎯 Project Context

ZapSlot is a comprehensive service booking platform built with Nuxt 4, featuring contractor management, service booking, calendar integration, and admin moderation. The project uses TypeScript, Prisma ORM with PostgreSQL, and follows modern development practices.

## 📋 Core Technologies

- **Framework**: Nuxt 4 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: DaisyUI with Tailwind CSS
- **Auth**: Custom authentication system
- **Testing**: Playwright MCP for E2E testing
- **Deployment**: Vercel with Docker support

## 🔧 Critical Development Rules

### 1. API Development Patterns

**⚠️ CRITICAL: Request Body Reading Order (CONFIRMED in Nuxt 4)**

When working with Nuxt 4 API endpoints, **always read request body FIRST** (this issue persists from Nuxt 3):

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

**Never do this:**
```typescript
// ❌ INCORRECT: Authorization first will cause readBody() to hang in Nuxt 4!
const session = await requireAuth(event)
const body = await readBody(event) // Will hang indefinitely!
```

### 2. Language Standards

- **All code must be in English**: variables, functions, comments, commit messages
- **User-facing messages**: English preferred
- **Console logs**: English preferred
- **Documentation**: Always in English

### 3. Error Handling Patterns

Always handle Zod validation errors properly:

```typescript
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
```

### 4. Database Operations

Use a single Prisma Client instance:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Use prisma...
})
```

### 5. Form Validation

For forms, use both client-side and server-side validation:

```typescript
// Client-side validation
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!form.value.field || form.value.field.length < 10) {
    errors.value.field = 'Field must contain at least 10 characters'
    isValid = false
  }

  return isValid
}
```

### 6. Authentication Patterns

For protected endpoints:

```typescript
const session = await requireAuth(event)
const user = session.user

// For admin routes (TODO: implement role check)
// if (!session.user.isAdmin) {
//   throw createError({
//     statusCode: 403,
//     statusMessage: 'Admin access required'
//   })
// }
```

## 🏗️ Project Architecture

### Database Schema (Prisma)

Key models:
- `User` - Users with authentication
- `Contractor` - Service providers with application status
- `Service` - Services offered by contractors
- `Booking` - Service bookings by clients
- `ContractorCategory` - Service categories

### API Structure

```
server/api/
├── contractor/          # Contractor functionality
│   ├── apply.post.ts    # Submit application
│   ├── profile.get.ts   # Get profile
│   ├── profile.put.ts   # Update profile
│   └── services/        # Service management
├── contractors/         # Public contractor discovery
│   ├── index.get.ts     # Search contractors
│   ├── [id].get.ts      # Get contractor profile
│   └── categories.get.ts # Get categories
└── admin/               # Admin operations
    └── contractors/     # Contractor moderation
```

### Component Organization

```
components/
├── ContractorCard.vue          # Contractor display
├── ContractorApplicationModal.vue # Application form
├── ContractorProfileBlock.vue  # Profile management
├── ServiceCard.vue             # Service display
├── ServiceForm.vue             # Service creation/editing
└── app/                        # Shared components
    ├── Navbar.vue
    ├── AuthButton.vue
    └── NotificationToast.vue
```

## 🎨 UI/UX Guidelines

### DaisyUI Components

Use DaisyUI classes for consistency:

```vue
<!-- Cards -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>

<!-- Forms -->
<div class="form-control">
  <label class="label">
    <span class="label-text">Label</span>
  </label>
  <input type="text" class="input input-bordered" />
</div>

<!-- Modals -->
<dialog class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Modal Title</h3>
    <p class="py-4">Content</p>
    <div class="modal-action">
      <button class="btn">Close</button>
    </div>
  </div>
</dialog>
```

### Date Formatting

Always use the built-in `<NuxtTime>` component for consistent date formatting:

```vue
<!-- Relative time (preferred for user-generated content) -->
<NuxtTime :datetime="review.createdAt" />
<!-- Output: "2 hours ago", "Yesterday", "3 days ago" -->

<!-- Absolute date with custom format -->
<NuxtTime :datetime="user.createdAt" format="MMMM d, yyyy" />
<!-- Output: "March 15, 2024" -->

<!-- For consistent en-US locale across app -->
<NuxtTime :datetime="booking.scheduledAt" />
```

**Configuration:**
Set `htmlAttrs: { lang: 'en-US' }` in `nuxt.config.ts` for consistency.

**Benefits:**
- Consistent formatting across server and client
- Automatic hydration safety
- Built-in relative time formatting
- Locale support
- No custom date formatting composables needed

### TypeScript Patterns

Use strict typing for components:

```vue
<script setup lang="ts">
interface ComponentProps {
  required: string
  optional?: number
}

const props = defineProps<ComponentProps>()

const emit = defineEmits<{
  action: [data: SomeType]
}>()
</script>
```

## 🔐 Security & Authorization

### Middleware Usage

- `auth.global.ts` - Global authentication check
- `contractor.ts` - Contractor-specific middleware
- `admin.ts` - Admin access middleware

### Access Control Levels

1. **Guest Users**: Public contractor directory
2. **Authenticated Users**: Apply for contractor status (auto-approved), book services
3. **Active Contractors**: Full contractor dashboard, service management
4. **Administrators**: Full system access, contractor management capabilities

## 🧪 Testing Requirements

### Playwright MCP Testing

**Mandatory for all UI and E2E testing**

Use Playwright MCP tools for:
- Real browser interaction testing
- Complete user workflow testing
- Visual feedback and screenshots
- Network request monitoring
- Console log capture

### Testing Approach

1. **Test-First Development**: Always test existing functionality before building new features
2. **Real Browser Testing**: Use Playwright MCP for comprehensive testing
3. **Issue Documentation**: Create GitHub issues for bugs found during testing
4. **Iterative Development**: Fix issues as discovered, test each fix

## 📦 Data Models & Relationships

### Contractor Status Flow

```
AUTO-APPROVED (1) -> SUSPENDED (3) -> ACTIVE (1)
```

**Simplified System:**
- All contractor applications are automatically approved
- Status 1 = Active (default for new applications)
- Status 3 = Suspended (admin action only)
- No pending/rejected states - eliminates moderation queue

### Service Categories (20 categories)

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

### Availability System

The availability system is based on detailed contractor availability schedules:

- **ContractorAvailability**: Day-of-week based availability with specific start/end times
- **TimeSlot**: Blocked time slots for specific dates
- **Service booking**: Duration-based slot calculation with conflict detection

### Booking System

The booking system provides immediate confirmation for all service bookings:

- **Immediate Confirmation**: All bookings are created with CONFIRMED status (no approval needed)
- **Status Flow**: CONFIRMED → COMPLETED/CANCELLED (no PENDING state)
- **Real-time Updates**: Available slots refresh immediately after booking
- **Self-booking Prevention**: Users cannot book their own services
- **Advance Booking**: Minimum 2-hour advance booking requirement
- **Slot Validation**: Strong conflict detection prevents double bookings

## 🔄 Development Workflow

### Server Management

⚠️ **CRITICAL**: Before running `npm run dev`, always check if the development server is already running:
- Check active terminals in VS Code
- Run `lsof -i :3000` to see if port 3000 is in use
- If already running, use the existing server instead of starting a duplicate
- Multiple dev servers can cause port conflicts and performance issues

### Branch Strategy

1. Create feature branches from `main`
2. Use descriptive branch names: `feature/services-stage-2-contractor-interface-20`
3. Test existing functionality first
4. Document and fix issues found during testing
5. Iterative development with incremental commits

### GitHub Issues & PRs

**Issue Creation:**
```bash
gh issue create --title "🚀 Feature Name - Brief Description" \
  --body "## Requirements\n- [ ] Task 1\n- [ ] Task 2" \
  --label "enhancement"
```

**PR Creation with detailed body:**
```bash
# Create detailed PR body file
cat > pr-body.md << 'EOF'
## Completed
- [x] Feature 1
- [x] Feature 2

## Technical Implementation
- [x] Backend APIs
- [x] Frontend Components
- [x] Authentication

## Testing Results
- [x] Manual testing
- [x] Playwright MCP testing
EOF

gh pr create --title "✅ Feature Complete" \
  --body-file pr-body.md \
  --base main --head feature/branch
```

## 📁 File Naming Conventions

### API Endpoints

- `[resource].get.ts` - GET endpoint
- `[resource].post.ts` - POST endpoint  
- `[resource].put.ts` - PUT endpoint
- `[resource].delete.ts` - DELETE endpoint
- `[resource].patch.ts` - PATCH endpoint
- `[id]/[action].patch.ts` - Action on specific resource

### Components

- `PascalCase` for component names
- Descriptive names: `ContractorApplicationModal.vue`
- Suffix with component type: `Modal`, `Card`, `Form`, `Table`

### Pages

- `kebab-case` for file names
- RESTful structure: `[id].vue` for dynamic routes
- Nested folders for related pages

## 🎯 Current Implementation Status

### ✅ Completed Features

- **Database Schema**: Contractor, Service, Booking models
- **Authentication System**: User auth with session management
- **Contractor Application**: Multi-step application form
- **Service Management**: CRUD operations for contractor services
- **Booking System**: Immediate confirmation booking with CONFIRMED status
- **Calendar Integration**: Real-time availability and booking slots
- **Admin Interface**: Contractor moderation dashboard
- **Public Directory**: Contractor discovery and search
- **Calendar Integration**: Availability and booking calendar

### 🔄 Current Focus

- **Stage 7**: Calendar integration enhancements
- **Testing**: Comprehensive Playwright MCP testing
- **Performance**: Optimization and bug fixes
- **Documentation**: API documentation and guides

## 🎨 UI Components Library

### Common Patterns

**Loading States:**
```vue
<button class="btn btn-primary" :disabled="loading">
  <span v-if="loading" class="loading loading-spinner"></span>
  {{ loading ? 'Processing...' : 'Submit' }}
</button>
```

**Error Handling:**
```vue
<div v-if="error" class="alert alert-error">
  <Icon name="alert-circle" />
  <span>{{ error }}</span>
</div>
```

**Form Validation:**
```vue
<div class="form-control">
  <input 
    :class="['input input-bordered', { 'input-error': errors.field }]"
    v-model="form.field"
  />
  <label v-if="errors.field" class="label">
    <span class="label-text-alt text-error">{{ errors.field }}</span>
  </label>
</div>
```

## � Debugging Guidelines

### Common Issues

1. **Request Body Reading**: Always read `await readBody(event)` before auth
2. **Database Connections**: Use single Prisma client instance
3. **Type Safety**: Ensure proper TypeScript interfaces
4. **Error Boundaries**: Handle Zod validation errors properly

### Debug Tools

- **Prisma Studio**: `npx prisma studio` at http://localhost:5555
- **Dev Server**: `npm run dev` at http://localhost:3000
  - ⚠️ **IMPORTANT**: Always check if the dev server is already running before starting a new one
  - Check active terminals or run `lsof -i :3000` to see if port 3000 is in use
  - If already running, use existing server instead of starting a duplicate
- **Database Logs**: Check Prisma query logs
- **Browser DevTools**: Network tab for API debugging

---

## 💡 Code Generation Tips

When generating code for this project:

1. **Follow the request body → auth pattern** for API endpoints
2. **Use DaisyUI classes** for consistent styling  
3. **Include proper TypeScript interfaces** for all components
4. **Add error handling** with appropriate HTTP status codes
5. **Test with Playwright MCP** for UI functionality
6. **Document complex logic** with English comments
7. **Follow the established file structure** and naming conventions
8. **Consider the contractor workflow** when building features
9. **Implement proper access control** based on user roles
10. **Use the existing composables** and utilities when available

This project emphasizes **testing-first development**, **real browser testing with Playwright MCP**, and **comprehensive documentation** for all features.

## 🏗️ Project Structure

```
├── components/          # Vue components
├── pages/              # Nuxt pages
│   ├── admin/          # Admin panel pages
│   │   └── contractors.vue  # Contractor management interface
├── server/api/         # API endpoints
│   ├── contractor/     # Contractor functionality
│   ├── admin/          # Admin endpoints
│   │   └── contractors/ # Admin contractor management
│   └── user/           # User endpoints
├── prisma/             # Database schema and migrations
├── composables/        # Vue composables
├── stores/             # Pinia stores
└── docs/               # Documentation
```

### Admin Panel Architecture

**Page: `/admin/contractors`**

- **Purpose**: Contractor management interface (not moderation)
- **Features**:
  - Real-time statistics dashboard (Total, Active, Suspended, Services)
  - Advanced filtering by status and pagination
  - Individual contractor profile viewing
  - Status management (activate/suspend contractors)
  - Contractor management tools
  - Responsive design with DaisyUI components

**Key Components**:

- Statistics cards with live data
- Filter controls for status and page size
- Contractor cards with user information and service details
- Status management buttons with loading states
- Empty state handling
- Pagination controls

**Security**: Currently uses basic authentication - TODO: Add admin role verification

## 📋 GitHub Workflow

### Creating Issues with GitHub CLI

**Available labels**: enhancement, bug, documentation, duplicate, good first issue, help wanted, invalid, question, wontfix

**Example: Create issue for completed work**
```bash
gh issue create --title "✅ Feature Name - Brief Description" \
  --body "## Completed\n- [x] Item 1\n- [x] Item 2\n\n**Next:** Next steps" \
  --label "enhancement"
```

### Creating Pull Requests with GitHub CLI

**Recommended: Use --body-file for detailed descriptions**

```bash
# Create PR body file
cat > pr-body.md << 'EOF'
## Completed
- [x] Service Management Interface (/contractor/services)
- [x] Booking Management Interface (/contractor/bookings)  
- [x] Service Creation/Edit Form with validation
- [x] Authentication & Authorization System

## Technical Implementation
- [x] Backend APIs: GET/POST/PUT/DELETE/PATCH for services
- [x] Frontend Components: ServiceForm, service cards, booking filters
- [x] Authentication Flow: contractor middleware and auth store

## Testing Results
- [x] Manual testing across all features
- [x] Playwright MCP automation testing

**Reference:** docs/services-plan.md Stage 2
**Next:** Ready for Stage 3 - Public Service Catalog
EOF

# Create PR using body file
gh pr create --title "✅ Services System - Stage 2: Contractor Interface" \
  --body-file pr-body.md \
  --base main --head feature/services-stage-2

# Clean up
rm pr-body.md
```

## 🔄 Migration Guidelines

When changing database schema:

1. Update `prisma/schema.prisma`
2. Run `prisma migrate dev --name descriptive_name`
3. Update types in components
4. Check API compatibility
5. Update documentation

## 🚀 Deployment Checklist

- [ ] All migrations applied
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Authentication working
- [ ] UI components display correctly
- [ ] Errors handled gracefully
