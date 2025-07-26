# ZapSlot - Nuxt 3 Authentication App

A modern Nuxt 3 application with authentication, user profiles, and dashboard functionality.

## Features

- 🔐 **Authentication**: GitHub OAuth integration using Better Auth
- 👤 **User Profiles**: Complete profile management with editing capabilities
- 📊 **Dashboard**: User dashboard with activity overview
- 🎨 **Modern UI**: Tailwind CSS with DaisyUI components
- 🔒 **Type Safety**: Full TypeScript support
- 💾 **Database**: PostgreSQL with Prisma ORM
- 🌙 **Theme Support**: Light/dark mode toggle
- 🛡️ **Server-Side Authentication**: Protected routes with SSR security

## Authentication Architecture

This application implements **server-side authentication** for improved security:

### Server-Side Protection
- Routes `/dashboard` and `/profile` are protected by server-side middleware
- Authentication is checked before page rendering (SSR)
- Unauthorized users are redirected before sensitive data loads
- All API endpoints require valid authentication

### Security Features
- No client-side authentication bypass possible
- Protected data is never loaded for unauthenticated users
- Server-side session validation using Better Auth
- Secure cookie-based session management

### Implementation Details
- `middleware/auth.global.ts` - Global server-side authentication middleware
- `server/api/auth/get-session.ts` - Session validation endpoint
- `server/utils/auth.ts` - Server-side authentication utilities
- `composables/useAuth.ts` - Client-side authentication composable

## Pages

- `/` - Home page with authentication
- `/profile` - User profile page (authenticated users only)
- `/dashboard` - User dashboard (authenticated users only)

## API Endpoints

- `GET /api/user/profile` - Fetch user profile data
- `PATCH /api/user/profile` - Update user profile
>>>>>>> Stashed changes

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
