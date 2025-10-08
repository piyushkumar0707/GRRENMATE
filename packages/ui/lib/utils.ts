import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  } else {
    return formatDate(date)
  }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function generatePlantId(): string {
  return `plant_${Math.random().toString(36).substr(2, 9)}`
}

export function getPlantHealthColor(health: number): string {
  if (health >= 80) return "text-green-500"
  if (health >= 60) return "text-yellow-500"
  if (health >= 40) return "text-orange-500"
  return "text-red-500"
}

export function getPlantHealthStatus(health: number): {
  status: string
  color: string
  bgColor: string
} {
  if (health >= 80) {
    return {
      status: "Healthy",
      color: "text-green-700",
      bgColor: "bg-green-100"
    }
  }
  if (health >= 60) {
    return {
      status: "Good",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100"
    }
  }
  if (health >= 40) {
    return {
      status: "Needs Attention",
      color: "text-orange-700",
      bgColor: "bg-orange-100"
    }
  }
  return {
    status: "Critical",
    color: "text-red-700",
    bgColor: "bg-red-100"
  }
}

export function calculateWateringSchedule(
  plantType: string,
  season: string,
  humidity: number
): number {
  // Base watering frequency in days
  let baseDays = 7

  // Adjust based on plant type
  switch (plantType.toLowerCase()) {
    case 'succulent':
      baseDays = 14
      break
    case 'tropical':
      baseDays = 5
      break
    case 'herb':
      baseDays = 3
      break
    case 'flowering':
      baseDays = 4
      break
    default:
      baseDays = 7
  }

  // Adjust based on season
  switch (season.toLowerCase()) {
    case 'summer':
      baseDays = Math.max(1, baseDays - 2)
      break
    case 'winter':
      baseDays = baseDays + 2
      break
    case 'spring':
    case 'fall':
      // No adjustment needed
      break
  }

  // Adjust based on humidity
  if (humidity > 70) {
    baseDays = baseDays + 1
  } else if (humidity < 30) {
    baseDays = Math.max(1, baseDays - 1)
  }

  return baseDays
}

export function getRandomPlantTip(): string {
  const tips = [
    "Most houseplants prefer bright, indirect light rather than direct sunlight.",
    "Water your plants when the top inch of soil feels dry to the touch.",
    "Yellow leaves often indicate overwatering, while brown tips suggest underwatering.",
    "Mist tropical plants regularly to increase humidity around them.",
    "Rotate your plants weekly to ensure even growth on all sides.",
    "Use room-temperature water to avoid shocking your plants' roots.",
    "Spring is the best time to repot most houseplants.",
    "Group plants together to create a more humid microclimate.",
    "Remove dead or yellowing leaves to prevent disease spread.",
    "Most plants benefit from weekly feeding during their growing season."
  ]
  
  return tips[Math.floor(Math.random() * tips.length)]
}

export const animations = {
  fadeIn: "animate-fade-in",
  fadeInUp: "animate-fade-in-up",
  slideUp: "animate-slide-up",
  float: "animate-float",
  pulse: "animate-pulse-gentle",
  glow: "animate-glow",
  shimmer: "animate-shimmer",
} as const

export const gradients = {
  primary: "bg-gradient-to-r from-primary-500 to-primary-600",
  accent: "bg-gradient-to-r from-accent-400 to-accent-600",
  soft: "bg-gradient-to-br from-primary-50 via-white to-accent-50",
  glass: "bg-gradient-to-br from-white/20 to-white/5",
} as const

export const shadows = {
  soft: "shadow-soft",
  glow: "shadow-glow-md",
  glass: "shadow-glass",
} as const
