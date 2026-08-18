import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export const cubicEaseOut = [0.22, 1, 0.36, 1];

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: cubicEaseOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: cubicEaseOut } }
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: cubicEaseOut } }
};

export function useReducedMotion() {
  return useFramerReducedMotion();
}
