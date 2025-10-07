# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Quick Start
```bash
# Install all dependencies for frontend and backend
npm run install:all

# Start both frontend and backend concurrently
npm run dev

# Start individually
npm run dev:frontend  # Frontend only (http://localhost:5173)
npm run dev:backend   # Backend only (http://localhost:5000)
```

### Frontend Commands
```bash
cd frontend

# Development server
npm run dev

# Build for production  
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend Commands
```bash
cd backend

# Start server in development mode (with nodemon)
npm run dev

# Start production server
npm start
```

### Build & Deployment
```bash
# Build frontend for production
npm run build

# Health check endpoint
curl http://localhost:5000/api/health
```

### Running Single Tests
Currently, no test framework is configured. The backend package.json shows:
```json
"test": "echo \"Error: no test specified\" && exit 1"
```

## Project Architecture

### Tech Stack Overview
- **Frontend**: React 18+ with Vite, Tailwind CSS, React Router, React Query
- **Backend**: Node.js with Express, MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Cloudinary for images
- **Development**: ESM modules throughout, nodemon for hot reload

### Monorepo Structure
This is a workspace-based monorepo with:
```
greenmate-app/
├── frontend/          # React frontend (Vite + Tailwind)
├── backend/           # Express.js API server  
├── package.json       # Root workspace configuration
└── node_modules/      # Shared dependencies
```

### Frontend Architecture

**Technology Choices**:
- **Vite**: Uses `rolldown-vite@7.1.14` instead of standard Vite
- **React**: Version 19+ with modern hooks
- **Routing**: React Router DOM v7+ with BrowserRouter
- **Styling**: Tailwind CSS with glassmorphism design system
- **State Management**: React Query for server state, built-in React state for UI
- **Animations**: Framer Motion for smooth animations

**Component Organization**:
```
src/
├── components/
│   ├── auth/         # Authentication components
│   ├── plant/        # Plant-specific components  
│   ├── layout/       # Layout components (Navbar, etc.)
│   └── ui/           # Reusable UI components
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── services/         # API service functions
├── utils/            # Helper functions
└── assets/           # Static assets
```

**Current Implementation Note**: The main App.jsx currently contains all components inline (LandingPage, Dashboard, PlantRecognition) rather than in separate files. This should be refactored for better organization.

### Backend Architecture

**Technology Choices**:
- **Express**: v5.1.0 with modern middleware
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, JWT authentication
- **File Handling**: Multer for uploads, Cloudinary for storage

**Directory Structure**:
```
backend/
├── config/
│   └── database.js   # MongoDB connection configuration
├── src/
│   ├── models/       # Mongoose schemas (User, Plant, etc.)
│   ├── routes/       # API route handlers
│   │   ├── auth.js   # Authentication endpoints
│   │   ├── plants.js # Plant management
│   │   ├── recognition.js # AI plant recognition
│   │   └── users.js  # User management
│   └── middleware/   # Custom middleware (auth, error handling)
├── uploads/          # Local file storage (temporary)
└── server.js         # Express app configuration
```

### Database Schema Design

**User Model**: Comprehensive schema including:
- Basic auth fields (username, email, password)
- Rich profile data (location, experience level, interests)
- Gamification system (points, streaks, badges, levels)
- Social features (followers, following, posts)
- Plant relationships and recognition history

**Key Design Patterns**:
- MongoDB ObjectId references for relationships
- Virtual fields for computed properties
- Pre-save middleware for password hashing
- Comprehensive indexing for performance
- Data transformation to exclude sensitive fields

### API Architecture

**Authentication Flow**:
- JWT-based authentication with secure password hashing
- Rate limiting: 100 requests per 15 minutes in production
- CORS configured for `http://localhost:5173` in development

**API Endpoints Structure**:
```
/api/auth/*          # Authentication & user management
/api/plants/*        # Plant CRUD operations
/api/recognition/*   # AI plant identification
/api/users/*         # User stats and social features
/api/health          # System health check
```

**Security Features**:
- Helmet.js for security headers
- Express rate limiting
- Content Security Policy configuration
- CORS with credential support
- Input validation and sanitization

### Development Workflow

**Environment Setup**:
- Backend requires `.env` file with MongoDB URI, JWT secrets, Cloudinary config
- Frontend connects to backend at `http://localhost:5000`
- Development mode uses `concurrently` to run both servers

**Code Quality**:
- ESLint configured for React with hooks and refresh rules
- ES modules used throughout (type: "module" in package.json)
- Modern async/await patterns
- Comprehensive error handling middleware

### Key Integration Points

1. **File Upload Flow**: Frontend → Multer → Cloudinary → Database URL storage
2. **Authentication**: React Query handles JWT token management and API calls
3. **Plant Recognition**: Image upload → AI service → Database storage → Frontend display
4. **Real-time Features**: Designed for WebSocket integration (not yet implemented)

### Performance Considerations

- Frontend uses Vite for fast development builds and HMR
- Database indexes on frequently queried fields (email, username, points)
- Image optimization through Cloudinary
- Rate limiting protects API from abuse
- Graceful database connection handling with proper shutdown procedures

### Development Notes

- The current frontend App.jsx contains all routes inline - consider extracting to separate page components
- Test framework needs to be configured for both frontend and backend
- Environment variables documentation is in README.md
- The project uses modern React patterns (hooks, functional components)
- MongoDB connection includes proper event handling and graceful shutdown