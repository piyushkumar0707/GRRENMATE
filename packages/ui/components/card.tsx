import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const cardVariants = cva(
  "rounded-lg border text-card-foreground shadow transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border-border shadow-sm hover:shadow-md",
        elevated: "bg-card border-border shadow-lg hover:shadow-xl hover:-translate-y-1",
        glass: "bg-white/10 backdrop-blur-md border-white/20 shadow-glass",
        gradient: "bg-gradient-to-br from-primary-50/50 to-accent-50/50 border-primary-100 shadow-soft",
        plant: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-soft hover:shadow-md",
        glow: "bg-card border-border shadow-glow-sm hover:shadow-glow-md",
        soft: "bg-card border-border shadow-soft hover:shadow-md hover:scale-[1.02]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1",
        scale: "hover:scale-[1.02]",
        glow: "hover:shadow-glow-md",
        bounce: "hover:animate-bounce-gentle",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  shimmer?: boolean
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, shimmer, interactive, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding, hover }),
        interactive && "cursor-pointer interactive",
        shimmer && "shimmer",
        className
      )}
      {...props}
    >
      {children}
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg" />
      )}
    </div>
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized plant card component
export interface PlantCardProps extends CardProps {
  plantName: string
  plantType: string
  health: number
  lastWatered?: Date
  image?: string
  onWater?: () => void
  onViewDetails?: () => void
}

const PlantCard = React.forwardRef<HTMLDivElement, PlantCardProps>(
  ({ 
    className, 
    plantName, 
    plantType, 
    health, 
    lastWatered, 
    image, 
    onWater, 
    onViewDetails,
    ...props 
  }, ref) => {
    const healthColor = health >= 80 ? "text-green-500" : health >= 60 ? "text-yellow-500" : "text-red-500"
    const healthBg = health >= 80 ? "bg-green-100" : health >= 60 ? "bg-yellow-100" : "bg-red-100"

    return (
      <Card
        ref={ref}
        variant="plant"
        hover="lift"
        interactive
        className={cn("overflow-hidden group", className)}
        {...props}
      >
        {image && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={image}
              alt={plantName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute top-3 right-3">
              <div className={cn("px-2 py-1 rounded-full text-xs font-medium", healthBg, healthColor)}>
                {health}% Health
              </div>
            </div>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">{plantName}</CardTitle>
          <CardDescription className="text-primary-600">{plantType}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Health Status</span>
            <div className="flex items-center space-x-2">
              <div className={cn("w-2 h-2 rounded-full", 
                health >= 80 ? "bg-green-500" : 
                health >= 60 ? "bg-yellow-500" : "bg-red-500"
              )} />
              <span className={healthColor}>
                {health >= 80 ? "Healthy" : health >= 60 ? "Good" : "Needs Care"}
              </span>
            </div>
          </div>
          
          {lastWatered && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Watered</span>
              <span>{lastWatered.toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={cn("h-2 rounded-full transition-all duration-300",
                health >= 80 ? "bg-green-500" : 
                health >= 60 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${health}%` }}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2">
          {onWater && (
            <button
              onClick={onWater}
              className="flex-1 btn-primary text-sm py-2 px-4 rounded-md transition-all duration-200"
            >
              💧 Water
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 btn-ghost text-sm py-2 px-4 rounded-md transition-all duration-200"
            >
              View Details
            </button>
          )}
        </CardFooter>
      </Card>
    )
  }
)
PlantCard.displayName = "PlantCard"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, PlantCard, cardVariants }