import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

type AnimationType = 
  | 'fade-in'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-up'
  | 'slide-in-down'
  | 'scale-in';

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  animationType?: AnimationType;
  threshold?: number;
  delay?: number;
  rootMargin?: string;
  className?: string;
  disabled?: boolean;
  /** Accessibility: Add role and aria-label if needed */
  role?: string;
  ariaLabel?: string;
}

/**
 * Wrapper component that applies scroll-triggered animations to its children
 * 
 * Features:
 * - Scroll-triggered reveal animations
 * - Accessibility-first: respects prefers-reduced-motion
 * - Performance optimized with Intersection Observer
 * - 60fps smooth animations
 * 
 * Usage:
 * ```tsx
 * <ScrollAnimationWrapper 
 *   animationType="slide-in-up"
 *   delay={200}
 *   threshold={0.2}
 * >
 *   <YourComponent />
 * </ScrollAnimationWrapper>
 * ```
 */
export const ScrollAnimationWrapper = ({
  children,
  animationType = 'fade-in',
  threshold = 0.1,
  delay = 0,
  rootMargin = '0px',
  className = '',
  disabled = false,
  role,
  ariaLabel,
}: ScrollAnimationWrapperProps) => {
  const { ref, animationClass, prefersReducedMotion } = useScrollAnimation({
    threshold,
    rootMargin,
    animationType,
    delay,
    disabled,
  });

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
      role={role}
      aria-label={ariaLabel}
      {...(prefersReducedMotion && { 'data-prefers-reduced-motion': true })}
    >
      {children}
    </div>
  );
};

export default ScrollAnimationWrapper;
