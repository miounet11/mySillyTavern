/**
 * Animation configurations and utilities
 * Can be used with framer-motion or CSS animations
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.3 }
}

export const slideInFromRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
  transition: { duration: 0.3 }
}

export const slideInFromLeft = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
  transition: { duration: 0.3 }
}

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 15px rgba(59, 130, 246, 0.3)',
      '0 0 30px rgba(59, 130, 246, 0.6)',
      '0 0 15px rgba(59, 130, 246, 0.3)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Helper function to create stagger delay
export const getStaggerDelay = (index: number, baseDelay: number = 0.05) => {
  return index * baseDelay
}

// Animation presets
export const animationPresets = {
  card: fadeInUp,
  modal: scaleIn,
  sidebar: slideInFromLeft,
  notification: slideInFromRight,
  list: staggerChildren
}

