# 🌱 GreenMate - Your Smart Plant Companion

![GreenMate Logo](https://via.placeholder.com/800x200/22c55e/ffffff?text=GreenMate+-+Smart+Plant+Care+Platform)

A comprehensive full-stack plant care application built with modern technologies. GreenMate combines AI-powered plant recognition, personalized care guides, community features, and smart reminders to help plant enthusiasts keep their green friends healthy and thriving.

## ✨ Features

### 🤖 AI-Powered Plant Recognition
- **95% Accuracy**: Upload photos to instantly identify plants using advanced machine learning
- **Comprehensive Database**: Access to thousands of plant species with detailed information
- **Quick Identification**: Get results in seconds with scientific names and common names

### 📱 Smart Dashboard
- **Plant Collection Management**: Track all your plants in one beautiful interface
- **Health Monitoring**: Real-time health status with visual indicators
- **Care Scheduling**: Smart watering reminders based on plant needs and weather
- **Statistics & Insights**: Track your plant care journey with detailed analytics

### 🎯 Personalized Care Guides
- **Species-Specific Instructions**: Tailored care guides for each plant type
- **Location-Aware Suggestions**: Recommendations based on your climate and location
- **Seasonal Care Tips**: Adapt care routines throughout the year
- **Expert Advice**: Professional tips for optimal plant health

### 🏥 Disease Detection (Coming Soon)
- **AI Diagnosis**: Upload photos of plant issues for instant diagnosis
- **Treatment Plans**: Get specific treatment recommendations
- **Prevention Tips**: Learn how to prevent common plant diseases

### 👥 Community Features
- **Plant Community**: Connect with fellow plant enthusiasts worldwide
- **Share Experiences**: Post photos and stories of your plant journey
- **Expert Q&A**: Get advice from certified plant experts
- **Achievement System**: Unlock badges and track your plant care milestones

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **React Query** - Server state management
- **React Hook Form** - Form handling with validation

### Backend
- **Node.js & Express** - RESTful API server
- **TypeScript** - Type-safe backend development
- **Prisma ORM** - Database management and migrations
- **PostgreSQL** - Primary database
- **JWT Authentication** - Secure user authentication
- **bcryptjs** - Password hashing
- **Zod** - Runtime type validation

### External Services
- **OpenAI API** - AI-powered plant identification
- **PlantNet API** - Plant species database
- **Cloudinary** - Image storage and optimization
- **OpenWeather API** - Weather-based care recommendations

### Development Tools
- **Turbo** - Monorepo build system
- **ESLint & Prettier** - Code formatting and linting
- **Husky** - Git hooks for code quality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/piyushkumar0707/GRRENMATE.git
   cd GRRENMATE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   **Backend (.env in apps/api/)**
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3001
   CORS_ORIGIN=http://localhost:3000

   # JWT Configuration (REQUIRED)
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/greenmate

   # External API Keys
   OPENAI_API_KEY=your_openai_api_key
   PLANTNET_API_KEY=your_plantnet_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   **Frontend (.env.local in apps/web/)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   cd packages/database
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npm run seed
   ```

5. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   # Backend only
   npm run dev:api
   
   # Frontend only  
   npm run dev:web
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/health

## 📁 Project Structure

```
GRRENMATE/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   └── components/    # React components
│   │   └── package.json
│   └── api/                   # Express.js backend
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Express middleware
│       │   └── config/        # Configuration
│       └── package.json
├── packages/
│   ├── ui/                    # Shared UI components
│   │   ├── components/        # Reusable components
│   │   └── lib/              # Utility functions
│   └── database/              # Prisma schema & client
│       ├── prisma/           # Database schema
│       └── src/              # Database utilities
├── package.json               # Root package.json
└── turbo.json                # Turbo configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Plants
- `GET /api/plants` - Get all plants
- `POST /api/plants` - Add new plant
- `GET /api/plants/:id` - Get plant details
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### Recognition
- `POST /api/recognition/identify` - Identify plant from image
- `GET /api/recognition/history` - Get identification history

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Backend (Railway/Heroku)
1. Create a new project on Railway or Heroku
2. Connect your GitHub repository
3. Set environment variables
4. Deploy the `apps/api` directory

### Database (Supabase/PlanetScale)
1. Create a PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npx prisma db push`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation as needed

## 📱 Mobile App (Coming Soon)
- React Native version in development
- Offline plant identification
- Camera integration for real-time identification
- Push notifications for care reminders

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Core plant management features
- [x] AI-powered plant identification
- [x] User authentication system
- [x] Basic dashboard and analytics

### Phase 2 (In Progress)  
- [ ] Disease detection and diagnosis
- [ ] Advanced community features
- [ ] Plant marketplace integration
- [ ] Weather-based care recommendations

### Phase 3 (Planned)
- [ ] Mobile app (React Native)
- [ ] IoT sensor integration
- [ ] Advanced AI features
- [ ] Plant care automation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Piyush Kumar**
- GitHub: [@piyushkumar0707](https://github.com/piyushkumar0707)

## 🙏 Acknowledgments

- PlantNet for plant identification API
- OpenAI for AI capabilities
- The amazing open-source community
- All plant enthusiasts who inspire this project

## 📞 Support

If you have any questions or need help with setup, please:
1. Check the [Issues](https://github.com/piyushkumar0707/GRRENMATE/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

<div align="center">
  <p>Made with 💚 for plant lovers everywhere</p>
  <p>Happy Growing! 🌱</p>
</div>