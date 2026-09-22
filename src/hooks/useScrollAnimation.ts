import { useEffect, useRef, useState } from 'react';

type AnimationType = 
  | 'fade-in'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-up'
  | 'slide-in-down'
  | 'scale-in';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  animationType?: AnimationType;
  delay?: number;
  disabled?: boolean;
}

/**
 * Detects if user prefers reduced motion
 * Respects accessibility standards for motion-sensitive users
 */
const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Custom hook for scroll-triggered animations
 * @param options - Configuration for the animation
 * @returns Object with ref to attach to element and isVisible state
 */
export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animationType = 'fade-in',
    delay = 0,
    disabled = false,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Respect reduced motion preference
    if (disabled || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add delay if specified, but respect prefers-reduced-motion
          if (delay > 0 && !prefersReducedMotion) {
            const timeoutId = setTimeout(() => {
              setIsVisible(true);
            }, delay);
            return () => clearTimeout(timeoutId);
          } else {
            setIsVisible(true);
          }
          // Stop observing after animation triggers
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, delay, disabled, prefersReducedMotion]);

  const getAnimationClass = () => {
    if (prefersReducedMotion || disabled) {
      return '';
    }
    const baseClass = `scroll-${animationType}`;
    const visibleClass = `scroll-${animationType}-visible`;
    return isVisible ? visibleClass : baseClass;
  };

  return {
    ref,
    isVisible: isVisible || prefersReducedMotion || disabled,
    animationClass: getAnimationClass(),
    prefersReducedMotion,
  };
};

/**
 * Hook for multiple scroll animations in a list with staggered timing
 * @param length - Number of items to animate
 * @param options - Configuration options
 * @returns Object with methods to register refs and get animation classes
 */
export const useScrollAnimationList = (
  length: number,
  options: UseScrollAnimationOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animationType = 'fade-in',
    delay = 100,
    disabled = false,
  } = options;

  const refs = useRef<HTMLDivElement[]>([]);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(length).fill(false)
  );
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Respect reduced motion preference
    if (disabled || prefersReducedMotion) {
      setVisibleItems(new Array(length).fill(true));
      return;
    }

    const observers: IntersectionObserver[] = [];

    refs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const staggerDelay = delay * index;
            const timeoutId = setTimeout(() => {
              setVisibleItems((prev) => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
              });
            }, staggerDelay);
            observer.unobserve(el);
            return () => clearTimeout(timeoutId);
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [length, threshold, rootMargin, delay, disabled, prefersReducedMotion]);

  const getAnimationClass = (index: number) => {
    if (prefersReducedMotion || disabled) {
      return '';
    }
    const baseClass = `scroll-${animationType}`;
    const visibleClass = `scroll-${animationType}-visible`;
    return visibleItems[index] ? visibleClass : baseClass;
  };

  const registerRef = (index: number, el: HTMLDivElement | null) => {
    if (el) {
      refs.current[index] = el;
    }
  };

  return {
    registerRef,
    getAnimationClass,
    visibleItems,
    prefersReducedMotion,
  };
};

/**
 * Hook for scroll direction detection
 * @returns Current scroll direction ('up' or 'down')
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollTop = useRef(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollTop = window.scrollY;

      if (Math.abs(scrollTop - lastScrollTop.current) < 5) {
        ticking = false;
        return;
      }

      setScrollDirection(scrollTop > lastScrollTop.current ? 'down' : 'up');
      lastScrollTop.current = scrollTop > 0 ? scrollTop : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return scrollDirection;
};
