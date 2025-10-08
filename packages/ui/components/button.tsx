import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary-500 to-primary-600 text-primary-foreground shadow-lg hover:from-primary-600 hover:to-primary-700 hover:shadow-glow-sm hover:-translate-y-0.5',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:-translate-y-0.5',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md hover:-translate-y-0.5',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 transition-all duration-200',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 shadow-sm hover:shadow-md',
        glass:
          'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-glass hover:-translate-y-0.5',
        gradient:
          'bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-white shadow-lg hover:shadow-glow-md hover:-translate-y-0.5 bg-[length:200%] hover:bg-[position:100%]',
        glow:
          'bg-primary text-primary-foreground shadow-glow-sm hover:shadow-glow-md hover:-translate-y-0.5',
        plant:
          'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg hover:from-green-500 hover:to-green-600 hover:shadow-glow-sm hover:-translate-y-0.5',
        accent:
          'bg-gradient-to-r from-accent-400 to-accent-500 text-white shadow-lg hover:from-accent-500 hover:to-accent-600 hover:shadow-lg hover:-translate-y-0.5',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base',
        xl: 'h-12 rounded-xl px-10 text-lg font-semibold',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  shimmer?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false, 
    leftIcon, 
    rightIcon, 
    shimmer = false,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    // When asChild is true, we should pass all styling to the child
    // and not add extra elements like icons or shimmer
    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size }),
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }
    
    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          shimmer && 'shimmer',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0 flex items-center">{leftIcon}</span>
        )}
        <span className="relative z-10">{children}</span>
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0 flex items-center">{rightIcon}</span>
        )}
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
