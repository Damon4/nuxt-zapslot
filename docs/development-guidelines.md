# Development Guidelines

## API Development Best Practices

### Nuxt 3 Event Handler Patterns

#### ⚠️ Critical: Request Body Reading Order

When working with Nuxt 3 API endpoints, **operation order is critical** for proper request body handling:

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

#### 🚫 Incorrect order:

```typescript
export default defineEventHandler(async (event) => {
  try {
    // ❌ INCORRECT: Authorization first
    const session = await requireAuth(event)

    // ❌ INCORRECT: Then reading request body
    const body = await readBody(event) // May not work!
  } catch (error) {
    // Error handling
  }
})
```

#### Explanation

`requireAuth()` may modify the state of the `event` object, making subsequent `readBody()` calls impossible or incorrect. Always read the request body **before** any operations that might modify the event object.

#### Applies to:

- POST endpoints with JSON body
- PUT/PATCH endpoints with update data
- Any endpoints using `readBody(event)`

### Database Operations

#### Prisma Client Usage

Use a single Prisma Client instance:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Use prisma...
})
```

#### Error Handling

Always handle Zod validation errors:

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

### Authentication

#### Session Validation

Always check session for protected endpoints:

```typescript
const session = await requireAuth(event)
const user = session.user
```

#### Admin Routes

For admin routes, add role verification:

```typescript
const session = await requireAuth(event)

// TODO: Add admin role check
// if (!session.user.isAdmin) {
//   throw createError({
//     statusCode: 403,
//     statusMessage: 'Admin access required'
//   })
// }
```

### Component Development

#### TypeScript Types

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

#### Form Validation

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

### Code Style

#### Language Standards

- **All code must be written in English** including:
  - Variable names, function names, class names
  - Comments and documentation
  - Commit messages
  - Code documentation
- **User-facing messages** should be in English
- **Console logs** can be in any language but English is preferred

#### Comments

- Comments in English for all code
- Mandatory comments for critical moments (like readBody order)
- Document complex business logic
- Use JSDoc format for functions and APIs

#### Error Messages

- User-facing messages in English
- HTTP status codes must follow standards
- Provide clear and actionable error descriptions

### Testing

#### Playwright MCP Requirement

**For all UI and end-to-end testing, use Playwright MCP.**

Playwright MCP provides real browser automation capabilities and is the mandatory testing tool for this project. It offers:

- Real browser interaction (not headless simulation)
- Complete user workflow testing
- Visual feedback and screenshot capabilities
- Network request monitoring
- Console log capture
- Perfect integration for complex UI testing scenarios

**Usage**: When testing functionality, always use Playwright MCP tools to ensure comprehensive and reliable test coverage.

### GitHub Issues Management

#### Creating Issues with GitHub CLI

Use GitHub CLI for creating issues when documenting completed work or planning features.

**Important:** Use only these labels (as configured in this repository):

- enhancement
- bug
- documentation
- duplicate
- good first issue
- help wanted
- invalid
- question
- wontfix

If you need a new label, add it in the repository settings first.

**Example: Create issue for completed work**

```bash
gh issue create --title "✅ Feature Name - Brief Description" \
  --body "## Completed\n- [x] Item 1\n- [x] Item 2\n\n**Next:** Next steps" \
  --label "enhancement"
```

**Example: Create issue for new feature planning**

```bash
gh issue create --title "🚀 Feature Name - Implementation Plan" \
  --body "## Requirements\n- [ ] Task 1\n- [ ] Task 2\n\n## Acceptance Criteria\n- Criteria 1\n- Criteria 2" \
  --label "enhancement"
```

#### Creating Pull Requests with GitHub CLI

**Recommended: Use --body-file for detailed descriptions**

For complex pull requests with detailed descriptions, create a separate markdown file:

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

**Alternative: Simple PR with inline body**

For simple pull requests, you can still use inline body:

```bash
gh pr create --title "📝 Documentation Update" \
  --body "## Summary\n- Updated GitHub CLI guidelines\n- Added body-file recommendation\n\n**Next:** Review and merge" \
  --base main --head docs/update
```

#### Issue Formatting Standards

**Title Format:**

- ✅ `Feature Name - Brief Description` (for completed work)
- 🚀 `Feature Name - Implementation Plan` (for new features)
- 🐛 `Bug Name - Description` (for bugs)
- 📝 `Documentation Update` (for docs)

**Body Structure:**

- Use checkboxes `- [x]` for completed items
- Use checkboxes `- [ ]` for pending items
- Include **Next:** section for progression
- Keep descriptions concise but informative

#### Common Labels

- `enhancement` - new features
- `bug` - bug reports
- `documentation` - docs updates

## Project Structure

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

- **Purpose**: Complete contractor application management interface
- **Features**:
  - Real-time statistics dashboard (Total, Pending, Approved, Rejected)
  - Advanced filtering by status and pagination
  - Individual application review with detailed information
  - One-click approve/reject functionality
  - Status change dropdown for approved/rejected applications
  - Responsive design with DaisyUI components

**Key Components**:

- Statistics cards with live data
- Filter controls for status and page size
- Application cards with user information and service details
- Action buttons with loading states
- Empty state handling
- Pagination controls

**Security**: Currently uses basic authentication - TODO: Add admin role verification

## Migration Guidelines

When changing database schema:

1. Update `prisma/schema.prisma`
2. Run `prisma migrate dev --name descriptive_name`
3. Update types in components
4. Check API compatibility
5. Update documentation

## Deployment Checklist

- [ ] All migrations applied
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Authentication working
- [ ] UI components display correctly
- [ ] Errors handled gracefully
