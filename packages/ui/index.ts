// Components
export { Button, buttonVariants } from './components/button'
export type { ButtonProps } from './components/button'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, PlantCard, cardVariants } from './components/card'
export type { CardProps, PlantCardProps } from './components/card'

export { Hero } from './components/hero'
export type { HeroProps } from './components/hero'

export { PlantRecognition } from './components/plant-recognition'
export type { PlantRecognitionProps, PlantIdentificationResult } from './components/plant-recognition'

export { PlantDashboard } from './components/plant-dashboard'
export type { PlantDashboardProps, PlantData, DashboardStats } from './components/plant-dashboard'

export { PlantDetail } from './components/plant-detail'
export type { PlantDetailProps, PlantDetailData } from './components/plant-detail'

// Utils and helpers
export { 
  cn, 
  formatDate, 
  formatTimeAgo, 
  debounce, 
  throttle, 
  generatePlantId, 
  getPlantHealthColor, 
  getPlantHealthStatus, 
  calculateWateringSchedule, 
  getRandomPlantTip,
  animations,
  gradients,
  shadows
} from './lib/utils'

// Re-exports from lucide-react for convenience
export {
  Leaf,
  Camera,
  Users,
  Sparkles,
  Loader2,
  Heart,
  Settings,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Sun,
  Moon,
  Star,
  Eye,
  EyeOff,
  Home,
  User,
  MapPin,
  Calendar,
  Clock,
  Droplet,
  ThermometerSun,
  Zap,
  Bookmark,
  Share2,
  MessageCircle,
  TrendingUp,
} from 'lucide-react'
