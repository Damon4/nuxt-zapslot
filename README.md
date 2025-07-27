# ZapSlot - Modern Appointment Booking Platform

[![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82?style=flat&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.x-FF6B6B?style=flat)](https://www.better-auth.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, full-stack Nuxt 3 application for appointment booking with enterprise-grade authentication and user management.

## ✨ Features

- 🔐 **Secure Authentication**: GitHub OAuth integration with Better Auth
- 👤 **User Profile Management**: Complete profile editing with real-time validation
- 📊 **User Dashboard**: Comprehensive dashboard with statistics and activity overview
- 🎯 **Appointment Booking**: Easy-to-use booking system for services
- 🎨 **Modern UI/UX**: Tailwind CSS v4 with DaisyUI components and dark/light themes
- 🔒 **Type Safety**: Full TypeScript support across client and server
- 💾 **PostgreSQL Database**: Robust data persistence with Prisma ORM
- 🌙 **Theme System**: Automatic dark/light mode with user preference saving
- 🛡️ **SSR Security**: Server-side authentication with protected routes
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- 🚀 **Performance**: Optimized for speed with Nuxt 3's latest features
- ⚡ **Real-time Updates**: Instant UI feedback and notifications
- 🔧 **Developer Tools**: ESLint, Prettier, Husky for code quality

## 🏗️ Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Styling**: Tailwind CSS v4, DaisyUI
- **Authentication**: Better Auth with GitHub OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Tabler Icons via Nuxt Icon
- **State Management**: Pinia
- **Code Quality**: ESLint, Prettier, Husky, Lint-staged

## 🔐 Authentication Architecture

This application implements **enterprise-grade server-side authentication** for maximum security:

### 🛡️ Server-Side Protection
- Routes `/dashboard` and `/profile` are protected by server-side middleware
- Authentication validation occurs before page rendering (SSR)
- Unauthorized users are redirected before any sensitive data loads
- All API endpoints require valid session authentication
- No client-side authentication bypass possible

### 🔒 Security Features
- Server-side session validation using Better Auth
- Secure HTTP-only cookie-based session management  
- CSRF protection built-in
- Protected data never loads for unauthenticated users
- Automatic session refresh and validation

### 📁 Implementation Details
- `middleware/auth.global.ts` - Global server-side authentication middleware
- `server/api/auth/` - Authentication API routes and session management
- `server/utils/auth.ts` - Server-side authentication utilities
- `lib/auth.ts` - Better Auth configuration
- `stores/auth.ts` - Pinia store for client-side auth state
- `composables/useAuth.ts` - Client-side authentication composable

## 📄 Pages & Routes

- `/` - Landing page with service information and authentication
- `/dashboard` - User dashboard with statistics and activity (🔒 Protected)
- `/profile` - Complete user profile management (🔒 Protected)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - GitHub OAuth sign-in
- `POST /api/auth/signout` - User sign-out
- `GET /api/auth/get-session` - Session validation

### User Management  
- `GET /api/user/profile` - Fetch user profile data
- `PATCH /api/user/profile` - Update user profile information

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- GitHub OAuth App (for authentication)

### 1. Clone the repository

```bash
git clone https://github.com/Damon4/nuxt-zapslot.git
cd zapslot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zapslot"

# GitHub OAuth (create app at https://github.com/settings/developers)
AUTH_GITHUB_CLIENT_ID="your_github_client_id"
AUTH_GITHUB_CLIENT_SECRET="your_github_client_secret"

# Optional: Custom base URL
NUXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Open Prisma Studio to view your data
npx prisma studio
```

### 5. Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## 🏗️ Production Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Production Environment Variables

Ensure all environment variables are properly set in your production environment:

```env
DATABASE_URL="your_production_database_url"
AUTH_GITHUB_CLIENT_ID="your_github_client_id"
AUTH_GITHUB_CLIENT_SECRET="your_github_client_secret"
NUXT_PUBLIC_BASE_URL="https://your-domain.com"
```

## 🔧 Development Tools

### Code Quality
- **ESLint**: Linting with Nuxt ESLint configuration
- **Prettier**: Code formatting with Tailwind CSS plugin
- **Husky**: Git hooks for pre-commit validation
- **Lint-staged**: Run linters on staged files only

### Database Tools
- **Prisma Studio**: Visual database browser
- **Prisma Migrate**: Database schema migrations
- **Database Seeding**: Optional data seeding capabilities

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

## 📁 Project Structure

```
zapslot/
├── assets/css/           # Global CSS and Tailwind imports
├── components/app/       # Reusable Vue components
├── composables/          # Vue composables for shared logic
├── layouts/              # Nuxt layouts
├── lib/                  # Authentication and utility libraries
├── middleware/           # Route middleware (auth protection)
├── pages/                # File-based routing pages
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── server/               # API routes and server utilities
├── stores/               # Pinia state management
├── nuxt.config.ts        # Nuxt configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all checks pass (`npm run lint && npm run build`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📚 Resources

### 📖 Development Documentation
- [Development Guidelines](docs/development-guidelines.md) - Essential patterns and best practices for this project

### 🌐 External Documentation
- [Nuxt 3 Documentation](https://nuxt.com/docs/getting-started/introduction)
- [Better Auth Documentation](https://www.better-auth.com/docs/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Nuxt 3 and modern web technologies.
