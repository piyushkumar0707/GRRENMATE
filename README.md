# 🌱 GreenMate - AI-Powered Plant Care App

A modern, comprehensive plant care application built with the MERN stack, featuring AI-powered plant recognition, personalized care guides, and a vibrant community of plant enthusiasts.

![GreenMate](https://img.shields.io/badge/version-1.0.0-green)
![React](https://img.shields.io/badge/React-18+-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## ✨ Features

### 🎯 Core Features
- **AI Plant Recognition** - Instantly identify plants using advanced AI technology
- **Personalized Care Guides** - Get customized care instructions based on your location and expertise
- **Smart Reminders** - Never forget to water or care for your plants
- **Plant Community** - Connect with fellow plant enthusiasts and share your journey
- **Interactive Dashboard** - Track your plants' health and progress
- **Gamification** - Earn points and achievements for plant care activities

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Beautiful modern interface with blur effects
- **Responsive Layout** - Works perfectly on all devices
- **Smooth Animations** - Engaging transitions and hover effects
- **Dark/Light Theme** - Adaptive to user preferences
- **Progressive Web App** - Install on mobile and desktop

### 🔧 Technical Features
- **Real-time Updates** - Live plant status monitoring
- **Image Upload & Processing** - Cloudinary integration for plant photos
- **Email Notifications** - Care reminders and community updates
- **RESTful API** - Well-documented backend API
- **JWT Authentication** - Secure user authentication
- **Rate Limiting** - API protection and performance optimization

## 🚀 Tech Stack

### Frontend
- **React 18+** with Hooks and Context API
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing
- **React Query** for server state management
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Cloudinary** for image storage
- **Nodemailer** for email services
- **Express Rate Limit** for API protection

### Additional Tools
- **Concurrently** for running frontend and backend
- **Nodemon** for development hot reload
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for HTTP request logging

## 📁 Project Structure

```
greenmate-app/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # CSS and styling files
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js backend application
│   ├── controllers/        # Request handlers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Helper functions
│   ├── config/            # Configuration files
│   └── server.js          # Express server entry point
├── package.json           # Root package.json for scripts
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Git installed

### 1. Clone the Repository
```bash
git clone https://github.com/piyushkumar0707/GRRENMATE.git
cd GRRENMATE
```

### 2. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm install
```

### 3. Environment Setup
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greenmate
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@greenmate.com
FROM_NAME=GreenMate
```

### 4. Start the Application
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
npm run dev:frontend    # Frontend only (http://localhost:5173)
npm run dev:backend     # Backend only (http://localhost:5000)
```

### 5. Access the Application
- **Frontend**: http://localhost:5173 (or 5174 if 5173 is in use)
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Plant Recognition Endpoints
- `POST /api/recognition/identify` - Identify plant from image
- `GET /api/recognition/history` - Get identification history

### Plant Management Endpoints
- `GET /api/plants` - Get all plants
- `GET /api/plants/:id` - Get single plant
- `POST /api/plants` - Add new plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### User Statistics
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/leaderboard` - Get community leaderboard

## 🎨 UI Components

### Landing Page
- Hero section with animated elements
- Feature showcase with cards
- User testimonials
- Call-to-action sections
- Responsive navigation

### Dashboard
- Plant overview cards
- Health status indicators
- Care reminders
- Progress tracking
- Quick actions

### Plant Recognition
- Image upload interface
- Real-time plant identification
- Detailed plant information
- Care recommendations
- Save to collection

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt for password security
- **Rate Limiting** - API request limits
- **CORS Protection** - Cross-origin request security
- **Helmet Integration** - Security headers
- **Input Validation** - Request data validation
- **File Upload Security** - Safe image processing

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render/DigitalOcean)
```bash
cd backend
npm start
# Deploy with environment variables configured
```

### MongoDB (MongoDB Atlas)
Update the `MONGODB_URI` in your environment variables to use MongoDB Atlas connection string.

## 📈 Performance Optimizations

- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Cloudinary automatic optimization
- **API Caching** - React Query for efficient data fetching
- **Bundle Optimization** - Vite for optimal builds
- **Database Indexing** - MongoDB indexes for fast queries

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Piyush Kumar**
- GitHub: [@piyushkumar0707](https://github.com/piyushkumar0707)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Plant data and care instructions from various botanical sources
- AI plant recognition powered by machine learning APIs
- UI inspiration from modern design systems
- Community feedback and contributions

---

## 📱 Screenshots

*Coming soon - Beautiful screenshots of the GreenMate application in action*

---

<p align="center">Made with 💚 for plant lovers everywhere</p>