/**
 * Animation Configuration for Page Transitions
 * Using framer-motion for smooth, accessible animations
 */

// Animation variants for page transitions
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -20
  }
};

// Transition configuration
export const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

// Alternative animation variants
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideLeftVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
};

export const slideRightVariants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 }
};

export const zoomVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

export const scaleVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 }
};

// Fast transition for quick interactions
export const fastTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2
};

// Smooth transition for standard page changes
export const smoothTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.35
};

// Spring transition for dynamic feel
export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};
