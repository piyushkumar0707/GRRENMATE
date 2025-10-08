import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "./button"
import { Leaf, Sparkles, Camera, Users } from "lucide-react"

export interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  description?: string
  primaryCta?: {
    text: string
    onClick: () => void
  }
  secondaryCta?: {
    text: string
    onClick: () => void
  }
  features?: Array<{
    icon: React.ReactNode
    text: string
  }>
  backgroundImage?: string
  animated?: boolean
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ 
    className,
    title = "Your Smart Plant Companion",
    subtitle = "🌱 GreenMate",
    description = "AI-powered plant recognition, personalized care guides, and community platform for plant enthusiasts",
    primaryCta,
    secondaryCta,
    features,
    backgroundImage,
    animated = true,
    ...props 
  }, ref) => {
    const defaultFeatures = [
      {
        icon: <Camera className="h-5 w-5" />,
        text: "Plant Recognition"
      },
      {
        icon: <Leaf className="h-5 w-5" />,
        text: "Care Guides"
      },
      {
        icon: <Users className="h-5 w-5" />,
        text: "Community"
      },
      {
        icon: <Sparkles className="h-5 w-5" />,
        text: "AI Powered"
      }
    ]

    const heroFeatures = features || defaultFeatures

    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-screen flex items-center justify-center overflow-hidden",
          backgroundImage ? "bg-cover bg-center bg-no-repeat" : "bg-gradient-to-br from-primary-50 via-white to-accent-50",
          className
        )}
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
        {...props}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 plant-pattern opacity-30" />
        
        {/* Animated Background Elements */}
        {animated && (
          <>
            {/* Floating leaves */}
            <div className="absolute top-10 left-10 w-16 h-16 text-primary-300 animate-float opacity-20">
              <Leaf className="w-full h-full" />
            </div>
            <div className="absolute top-32 right-20 w-12 h-12 text-accent-300 animate-float opacity-30" style={{animationDelay: '1s'}}>
              <Leaf className="w-full h-full" />
            </div>
            <div className="absolute bottom-20 left-32 w-20 h-20 text-primary-200 animate-float opacity-25" style={{animationDelay: '2s'}}>
              <Leaf className="w-full h-full" />
            </div>
            <div className="absolute bottom-32 right-10 w-14 h-14 text-accent-200 animate-float opacity-20" style={{animationDelay: '0.5s'}}>
              <Leaf className="w-full h-full" />
            </div>
            
            {/* Sparkles */}
            <div className="absolute top-1/4 left-1/4 w-6 h-6 text-yellow-400 animate-pulse-gentle opacity-40">
              <Sparkles className="w-full h-full" />
            </div>
            <div className="absolute top-1/3 right-1/3 w-4 h-4 text-yellow-300 animate-pulse-gentle opacity-50" style={{animationDelay: '1.5s'}}>
              <Sparkles className="w-full h-full" />
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-5 h-5 text-yellow-500 animate-pulse-gentle opacity-30" style={{animationDelay: '3s'}}>
              <Sparkles className="w-full h-full" />
            </div>
          </>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 animate-fade-in-up">
            {/* Subtitle Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium animate-bounce-gentle">
              <Sparkles className="h-4 w-4" />
              <span>{subtitle}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading gradient-text leading-tight">
              {title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {heroFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center space-y-2 p-4 glass-card hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-center">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {primaryCta && (
                <Button
                  variant="gradient"
                  size="xl"
                  onClick={primaryCta.onClick}
                  className="glow-primary group"
                  rightIcon={
                    <Camera className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  }
                >
                  {primaryCta.text}
                </Button>
              )}
              
              {secondaryCta && (
                <Button
                  variant="glass"
                  size="xl"
                  onClick={secondaryCta.onClick}
                  className="backdrop-blur-md"
                  rightIcon={
                    <Users className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  }
                >
                  {secondaryCta.text}
                </Button>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                Trusted by plant enthusiasts worldwide
              </p>
              <div className="flex items-center justify-center space-x-8 opacity-60">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">95% Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
                  <span className="text-xs font-medium">10K+ Plants</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
                  <span className="text-xs font-medium">50K+ Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-400 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    )
  }
)

Hero.displayName = "Hero"

export { Hero }