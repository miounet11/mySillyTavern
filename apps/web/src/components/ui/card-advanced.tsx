/**
 * Advanced Card Component with gradient, glow, and glass effects
 */

"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardAdvancedProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'glow' | 'gradient'
  hover?: boolean
  onClick?: () => void
}

export function CardAdvanced({
  children,
  className = '',
  variant = 'default',
  hover = false,
  onClick
}: CardAdvancedProps) {
  const baseClasses = 'rounded-xl transition-all duration-300'
  
  const variantClasses = {
    default: 'bg-gray-800 border border-gray-700',
    glass: 'glass-card border border-gray-700/50',
    glow: 'character-card-glow',
    gradient: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
  }

  const hoverClasses = hover ? 'hover-lift cursor-pointer' : ''

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={cn('p-6 border-b border-gray-700/50', className)}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={cn('p-6 border-t border-gray-700/50', className)}>
      {children}
    </div>
  )
}

