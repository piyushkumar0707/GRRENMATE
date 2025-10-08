# 🚀 Quick Setup Guide for GreenMate

Get GreenMate running on your machine in **5 minutes**!

## One-Command Setup

```bash
./setup.sh
```

That's it! The script will:
- ✅ Check Node.js and npm versions
- ✅ Install dependencies automatically
- ✅ Create environment files
- ✅ Set up the database
- ✅ Create helpful scripts

## Alternative Setup (Manual)

If you prefer manual setup:

### 1. Prerequisites
```bash
# Check versions
node --version   # Should be >= 18
npm --version    # Should be >= 9

# Install if needed (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install Dependencies
```bash
npm install
npm run setup
```

### 3. Environment Setup
```bash
# Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env
```

### 4. Database Setup
```bash
# Start database (requires Docker)
docker-compose up -d

# Setup database schema
npm run db:generate
npm run db:push
npm run db:seed
```

## Starting Development

### Quick Start
```bash
./start.sh
```

### Manual Start
```bash
# Start database (if using Docker)
docker-compose up -d

# Start development servers
npm run dev
```

## Access Points

Once running, access these URLs:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database Admin**: http://localhost:8080
- **Prisma Studio**: `npm run db:studio`

## Common Commands

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:web          # Start only frontend
npm run dev:api          # Start only backend

# Database
npm run db:studio        # Database visual editor
npm run db:seed          # Add sample data
npm run db:push          # Update database schema

# Maintenance
npm run clean            # Clean all node_modules
npm run setup            # Reinstall everything
```

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000/3001
sudo lsof -t -i:3000 | xargs kill -9
sudo lsof -t -i:3001 | xargs kill -9
```

### Database Connection Issues
```bash
# Restart Docker services
docker-compose down
docker-compose up -d

# Wait 30 seconds, then:
npm run db:push
```

### Missing Dependencies
```bash
# Clean reinstall
npm run clean
npm install
npm run setup
```

## Features Requiring API Keys

Some features need external API keys (add to `apps/api/.env`):

- **Plant Recognition**: PlantNet API key
- **Weather Care**: OpenWeather API key  
- **Disease Detection**: OpenAI API key
- **Maps**: Google Maps API key

## Getting Help

- 📚 **Full Documentation**: `PROJECT_DOCUMENTATION.md`
- 🎓 **Learning Guide**: `BEGINNER_GUIDE_TO_WEB_DEVELOPMENT.md`
- 🛠️ **Development Guide**: `DEVELOPMENT.md`
- 📖 **README**: `README.md`

---

**Need help?** Check the documentation files or create an issue in the repository.

**Happy coding!** 🌱✨