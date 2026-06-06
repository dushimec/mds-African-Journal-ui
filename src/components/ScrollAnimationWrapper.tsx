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
}

/**
 * Wrapper component that applies scroll animations to its children
 * Usage:
 * <ScrollAnimationWrapper animationType="slide-in-up">
 *   <YourComponent />
 * </ScrollAnimationWrapper>
 */
export const ScrollAnimationWrapper = ({
  children,
  animationType = 'fade-in',
  threshold = 0.1,
  delay = 0,
  rootMargin = '0px',
  className = '',
}: ScrollAnimationWrapperProps) => {
  const { ref, animationClass } = useScrollAnimation({
    threshold,
    rootMargin,
    animationType,
    delay,
  });

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimationWrapper;
