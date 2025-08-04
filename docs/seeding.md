# Database Seeding Setup

This document describes the database seeding setup for ZapSlot, following Prisma's seeding best practices.

## Overview

The seeding system populates the database with initial data for development and testing purposes, including:

- **Contractor Categories**: 20 predefined service categories
- **Test Users**: 10 sample regular users for testing
- **Contractors**: 10 sample contractors with different specializations
- **Services**: 40 diverse services across all categories (2 per category)
- **Availability**: Realistic contractor availability schedules
- **Sample Bookings**: Example bookings for testing

## Files

- `prisma/seed.ts` - Development seeding script (includes test users and data)
- `prisma/seed.production.ts` - Production seeding script (only essential data)
- `package.json` - Contains seeding configuration and scripts

## Usage

### Run Seeding

```bash
# Method 1: Development seeding (includes test data)
npm run db:seed

# Method 2: Production seeding (only essential data)
npm run db:seed:prod

# Method 3: Using Prisma CLI (uses development seed)
npx prisma db seed

# Method 4: Direct execution
npx tsx prisma/seed.ts              # Development
npx tsx prisma/seed.production.ts   # Production
```

### Reset Database and Reseed

```bash
# Reset database and run migrations, then seed
npm run migrate:reset
npm run db:seed
```

### Automatic Seeding

The seed script is configured to run automatically when:
- Running `prisma migrate reset`
- Running `prisma migrate dev` (if database is empty)

## Seeded Data

### Users

| Name | Email | Role | ID |
|------|-------|------|------|
| John Smith | john@example.com | User/Contractor | user-001 |
| Sarah Johnson | sarah@example.com | User/Contractor | user-002 |
| Mike Davis | mike@example.com | User/Contractor | user-003 |
| Emma Wilson | emma@example.com | User/Contractor | user-004 |
| David Brown | david@example.com | User/Contractor | user-005 |
| Lisa Garcia | lisa@example.com | User/Contractor | user-006 |
| Robert Chen | robert@example.com | User/Contractor | user-007 |
| Maria Rodriguez | maria@example.com | User/Contractor | user-008 |
| Alex Thompson | alex@example.com | User/Contractor | user-009 |
| Jessica Kim | jessica@example.com | User/Contractor | user-010 |

### Contractors

| Name | Specialization | Price Range | Service Area |
|------|----------------|-------------|--------------|
| John Smith | ⚡ Electrical Work | $60-150/hour | NYC, Brooklyn, Queens |
| Sarah Johnson | 🧹 Cleaning Services | $30-120/hour | Manhattan, Bronx |
| Mike Davis | 🚿 Plumbing | $70-3500/hour | Greater NYC Area |
| Emma Wilson | 🎨 Design and Interior | $50-1500/hour | NYC, Westchester, Nassau |
| David Brown | 🌐 Web Development | $80-5000/hour | Remote, NYC Metro |
| Lisa Garcia | 🚗 Auto Services | $25-100/hour | NYC, Long Island |
| Robert Chen | 💄 Beauty and Health | $75-120/hour | Manhattan, Brooklyn |
| Maria Rodriguez | 📚 Tutoring and Education | $35-55/hour | NYC Metro Area |
| Alex Thompson | 📸 Photo and Video | $45-1200/hour | NYC, NJ, CT |
| Jessica Kim | ⚖️ Legal Services | $80-500/hour | New York State |

### Services

The system now includes comprehensive coverage of all 20 service categories:
- **Complete Coverage**: 2 services for each of the 20 categories (40 total services)
- **Diverse Contractors**: Services distributed across 10 different contractors
- **Varied Pricing**: From $25 delivery services to $5000 web applications
- **Different Types**: Hourly, fixed-price, and project-based services

Sample services by category:
- **⚡ Electrical Work**: Installation & Emergency Services (John)
- **🧹 Cleaning Services**: House & Office Cleaning (Sarah)
- **🚿 Plumbing**: Repair & Renovation (Mike)
- **🎨 Design and Interior**: Consultation & Makeover (Emma)
- **🌐 Web Development**: Websites & Applications (David)
- **🚗 Auto Services**: Repair & Diagnostics (Lisa)
- **💄 Beauty and Health**: Training & Nutrition (Robert)
- **📚 Tutoring**: Math & Science (Maria)
- **📸 Photo and Video**: Events & Portraits (Alex)
- **⚖️ Legal Services**: Consultation & Contract Review (Jessica)
- And 10 more categories with 2 services each...

### Availability

Contractors have realistic availability schedules:
- **Weekday workers**: Monday-Friday schedules
- **Mixed schedules**: Some include weekends
- **Different hours**: Morning to evening coverage
- **Flexible timing**: Accommodates different service types

## Categories

The system includes 20 predefined service categories:

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

## Customization

### Adding New Test Data

To add more test data, modify the arrays in `prisma/seed.ts`:

```typescript
// Add more users
const testUsers = [
  // existing users...
  {
    id: 'user-006',
    name: 'New User',
    email: 'newuser@example.com',
    // ... other fields
  }
]

// Add more contractors
const contractorData = [
  // existing contractors...
  {
    userId: 'user-006',
    description: 'New contractor description',
    categories: '🔨 Repair and Construction',
    // ... other fields
  }
]
```

### Environment-Specific Seeding

The project includes environment-specific seeding:

**Development Seeding** (`npm run db:seed`)
- Complete test dataset with users, contractors, services
- Sample bookings and realistic availability schedules
- Perfect for local development and testing

**Production Seeding** (`npm run db:seed:prod`)
- Only essential data (service categories)
- No test users or sample data
- Safe for production environments

For additional environments, you can create separate seed files:

```bash
prisma/
├── seed.ts              # Development seeding
├── seed.production.ts   # Production-safe seeding
└── seed.test.ts        # Test-specific seeding (optional)
```

Update package.json scripts accordingly:

```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:prod": "tsx prisma/seed.production.ts",
    "db:seed:test": "tsx prisma/seed.test.ts"
  }
}
```

## Best Practices

1. **Idempotent Operations**: Use `upsert` for data that shouldn't be duplicated
2. **Realistic Data**: Include varied, realistic test data
3. **Relationships**: Ensure proper foreign key relationships
4. **Error Handling**: Handle seeding errors gracefully
5. **Documentation**: Keep this documentation updated when adding new seed data

## Troubleshooting

### Common Issues

**Issue**: "Module not found" error
**Solution**: Ensure `tsx` is installed and TypeScript is configured

**Issue**: Database connection errors
**Solution**: Check `DATABASE_URL` in `.env` file

**Issue**: Foreign key constraint errors
**Solution**: Ensure parent records are created before child records

### Debug Mode

For detailed logging during seeding:

```bash
DEBUG=* npm run db:seed
```

### Manual Cleanup

If you need to clean up seeded data manually:

```sql
-- Remove all seeded data (careful!)
DELETE FROM booking WHERE client_id LIKE 'user-%';
DELETE FROM service WHERE contractor_id IN (SELECT id FROM contractor WHERE user_id LIKE 'user-%');
DELETE FROM contractor_availability WHERE contractor_id IN (SELECT id FROM contractor WHERE user_id LIKE 'user-%');
DELETE FROM contractor WHERE user_id LIKE 'user-%';
DELETE FROM "user" WHERE id LIKE 'user-%';
DELETE FROM contractor_category;
```

## Integration with Development Workflow

The seeding system integrates with the development workflow:

1. **Fresh Setup**: New developers run `npm install` → migrations → seeding
2. **Database Reset**: `npm run migrate:reset` automatically reseeds
3. **Testing**: Consistent test data for Playwright MCP tests
4. **Development**: Rich data for UI development and testing

This ensures all developers work with the same baseline data set.
