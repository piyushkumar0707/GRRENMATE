# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Quick Setup
```bash
# Install all dependencies
npm install

# Start database (requires Docker)
docker-compose up -d

# Initialize database
npm run db:generate
npm run db:push
npm run db:seed

# Start development servers
npm run dev
```

### Daily Development
```bash
# Start both frontend and backend
npm run dev

# Start individually:
npm run dev:web    # Next.js frontend (http://localhost:3000)
npm run dev:api    # Express backend (http://localhost:3001)
```

### Database Operations
```bash
# Visual database editor
npm run db:studio

# Apply schema changes
npm run db:push

# Create migration files
npm run db:migrate

# Reset and re-seed database
npm run db:reset
npm run db:seed

# Generate Prisma client
npm run db:generate
```

### Code Quality
```bash
# Lint all workspaces
npm run lint

# Fix linting issues
npm run lint:fix

# TypeScript check
npm run type-check
```

### Build & Production
```bash
# Build everything
npm run build

# Build individually:
npm run build:web
npm run build:api
```

### Running Individual Tests
No test framework is currently configured. To add testing:
- Frontend: Consider Vitest + React Testing Library
- Backend: Consider Jest + Supertest
- Database: Prisma supports test databases

## Project Architecture

### Tech Stack Overview
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js with TypeScript, Prisma ORM, PostgreSQL
- **Authentication**: JWT tokens with NextAuth.js integration
- **File Storage**: Cloudinary for images
- **Development**: Monorepo with npm workspaces, Docker for services

### Monorepo Structure
```
greenmate/
├── apps/
│   ├── web/                 # Next.js 14 frontend (port 3000)
│   └── api/                 # Express.js backend (port 3001)
├── packages/
│   ├── database/            # Prisma schema & client
│   └── ui/                  # Shared React components
├── docker-compose.yml       # PostgreSQL + Redis + Adminer
└── package.json            # Root workspace configuration
```

### Frontend Architecture (apps/web)

**Technology Choices**:
- **Next.js 14**: App Router with React Server Components
- **TypeScript**: Full type safety across the codebase
- **Tailwind CSS**: Utility-first styling with component variants
- **Radix UI**: Accessible component primitives with custom styling
- **Framer Motion**: Advanced animations and transitions
- **TanStack Query**: Server state management and caching
- **NextAuth.js**: Authentication with Prisma adapter

**Directory Structure**:
```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── demo/              # Demo pages
├── components/
│   └── providers.tsx      # Context providers setup
└── globals.css            # Global styles
```

### Backend Architecture (apps/api)

**Technology Choices**:
- **Express.js**: RESTful API server with TypeScript
- **Prisma**: Type-safe ORM with PostgreSQL
- **JWT**: Authentication with bcrypt password hashing
- **Zod**: Runtime type validation for API endpoints
- **Security**: Helmet, CORS, rate limiting

**Directory Structure**:
```
apps/api/src/
├── index.ts               # Express app entry point
├── config.ts              # Configuration management
├── routes/                # API route handlers
│   ├── auth.ts           # Authentication endpoints
│   ├── plants.ts         # Plant management
│   ├── recognition.ts    # AI plant identification
│   └── user.ts           # User management
└── middleware/           # Express middleware
    ├── auth.ts          # JWT authentication
    └── error.ts         # Error handling
```

### Database Architecture (packages/database)

**Prisma Schema Design**:
- **Comprehensive User Model**: Profile, gamification, social features
- **Plant Management**: Master plant data with detailed care instructions
- **User Plant Collection**: Personal plant tracking with care logs
- **Community Features**: Posts, comments, likes, follows
- **AI Integration**: Plant recognition and disease detection history
- **Marketplace**: Plant trading and review system

**Key Relationships**:
- Users have multiple plants with care tracking
- Plant recognition history with confidence scores
- Community features with moderation capabilities
- Comprehensive indexing for performance

### API Architecture

**Authentication Flow**:
- JWT-based authentication with refresh tokens
- NextAuth.js integration for social login support
- Rate limiting: 100 requests per 15 minutes
- CORS configured for localhost development

**API Endpoints Structure**:
```
/api/auth/*          # User authentication & management
/api/plants/*        # Plant CRUD operations  
/api/recognition/*   # AI plant identification
/api/user/*          # User profile & social features
/health              # System health check
```

### External Service Integration

**Required APIs**:
- **PlantNet API**: Plant species identification
- **Cloudinary**: Image storage and optimization
- **PostgreSQL**: Primary database (via Docker)

**Optional APIs**:
- **OpenWeather**: Climate-based care recommendations
- **OpenAI**: Enhanced AI features
- **Google Maps**: Location-based features

### Development Workflow

**Environment Setup**:
- Copy `.env.example` files to `.env` and `.env.local`
- Start PostgreSQL with Docker: `docker-compose up -d`
- Initialize database: `npm run db:push && npm run db:seed`
- Both apps connect via CORS on localhost ports

**Database Development**:
- Use Prisma Studio for visual database management
- Schema changes require `npm run db:push` or migrations
- Seed data available for consistent development
- Database admin interface at http://localhost:8080

**Code Quality Standards**:
- TypeScript strict mode enabled
- ESLint with TypeScript rules
- Consistent code formatting
- Type-safe API endpoints with Zod validation

### Key Integration Points

1. **Image Upload Flow**: Frontend → Cloudinary → Database URL storage
2. **Authentication**: NextAuth.js → JWT → Prisma user management
3. **Plant Recognition**: Image upload → PlantNet API → Database storage → Frontend display
4. **Type Safety**: Shared types between frontend/backend via Prisma client

### Performance & Deployment Considerations

- **Frontend**: Next.js optimizations, static generation where possible
- **Backend**: Database connection pooling, query optimization
- **Database**: Comprehensive indexing strategy in Prisma schema
- **Images**: Cloudinary optimization and CDN delivery
- **Caching**: Redis available for session storage and caching

### Development Notes

- **Legacy Code**: Old frontend/backend directories still exist but are superseded by apps/ structure
- **Testing**: No test framework configured yet - consider Vitest for frontend, Jest for backend
- **Environment**: Docker Compose handles all local services (PostgreSQL, Redis, Adminer)
- **Monorepo**: Shared dependencies managed at root level with npm workspaces
