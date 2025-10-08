# 🚀 GreenMate Development Guide

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Files
```bash
# Frontend environment
cp apps/web/.env.example apps/web/.env.local

# Backend environment  
cp apps/api/.env.example apps/api/.env
```

### 3. Start Database (Docker - Recommended)
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker-compose ps
```

**If you see containers running, use these connection strings:**

**Frontend** (`apps/web/.env.local`):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here-make-it-long
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** (`apps/api/.env`):
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret-key-make-it-at-least-32-characters-long
DATABASE_URL="postgresql://greenmate_user:greenmate_password@localhost:5432/greenmate"
CORS_ORIGIN=http://localhost:3000
```

### 4. Initialize Database
```bash
# Generate Prisma client
npm run db:generate

# Create tables
npm run db:push

# Add sample data
npm run db:seed
```

### 5. Start Development
```bash
# Start both frontend and backend
npm run dev
```

**That's it! 🎉**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001  
- Database Admin: http://localhost:8080

## Demo Login Credentials

After seeding, you can login with:
- **Email**: `demo@greenmate.app`
- **Password**: `password123`

## External APIs (Optional)

For full functionality, get these API keys:

### 1. Cloudinary (Required for image upload)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, API Secret
3. Add to both `.env` files:
```env
# Frontend
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Backend  
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. PlantNet (Required for plant recognition)
1. Request API key at [my-api.plantnet.org](https://my-api.plantnet.org)
2. Add to backend `.env`:
```env
PLANTNET_API_KEY=your_plantnet_api_key
```

### 3. OpenWeather (Optional - for climate features)
1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Add to backend `.env`:
```env
OPENWEATHER_API_KEY=your_openweather_api_key
```

## Development Workflow

### Daily Development
```bash
# Start development servers
npm run dev

# In separate terminals:
npm run dev:web    # Frontend only
npm run dev:api    # Backend only
```

### Database Operations
```bash
# View/edit data in browser
npm run db:studio

# Reset everything and re-seed
npm run db:reset
npm run db:seed

# Create new migration
npm run db:migrate

# Apply schema changes without migration
npm run db:push
```

### Code Quality
```bash
# Check TypeScript
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

```
greenmate/
├── apps/
│   ├── web/                 # Next.js frontend (port 3000)
│   └── api/                 # Express backend (port 3001)
├── packages/
│   ├── database/            # Prisma schema & models
│   └── ui/                  # Shared React components
└── docker-compose.yml       # PostgreSQL + Redis
```

## Common Commands

### Monorepo Management
```bash
npm install                  # Install all dependencies
npm run clean               # Remove all node_modules
npm run build               # Build everything
```

### Database (Prisma)
```bash
npm run db:generate         # Generate Prisma client
npm run db:push            # Push schema to database
npm run db:migrate         # Create migration file
npm run db:studio          # Open database GUI
npm run db:seed            # Add sample data
npm run db:reset           # Reset and re-seed
```

### Development
```bash
npm run dev                # Start everything
npm run dev:web            # Frontend only
npm run dev:api            # Backend only
```

### Code Quality
```bash
npm run lint               # Check all code
npm run lint:fix           # Fix linting issues
npm run type-check         # TypeScript validation
```

## Troubleshooting

### Database Issues
```bash
# Check if containers are running
docker-compose ps

# View container logs
docker-compose logs postgres

# Restart containers
docker-compose restart

# Reset everything
docker-compose down -v
docker-compose up -d
```

### Module Resolution Errors
```bash
# Clean install
npm run clean
npm install
npm run db:generate
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 3001  
npx kill-port 3001

# Or change ports in package.json scripts
```

### Frontend Can't Connect to Backend
1. Check backend is running on port 3001
2. Verify `NEXT_PUBLIC_API_URL=http://localhost:3001/api` in frontend `.env.local`
3. Check CORS settings in backend

### Database Connection Failed
1. Ensure Docker containers are running: `docker-compose ps`
2. Check `DATABASE_URL` in backend `.env`
3. Try: `npm run db:push` to sync schema

## API Testing

### Using curl
```bash
# Health check
curl http://localhost:3001/health

# Get plants
curl http://localhost:3001/api/plants

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

### Using Postman/Insomnia
Import this base URL: `http://localhost:3001/api`

## Next Steps

Once you have the basic setup working:

1. **Add your API keys** for full functionality
2. **Explore the codebase** - start with `apps/web/src/app/page.tsx`
3. **Check the database** with `npm run db:studio`
4. **Test the API** endpoints
5. **Start building features!**

## Need Help?

- 📚 Read the main [README.md](README.md) for full documentation
- 🔍 Check existing [issues on GitHub]()
- 💬 Join our [Discord community]()

Happy coding! 🌱