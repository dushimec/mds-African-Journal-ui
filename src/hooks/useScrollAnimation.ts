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
}

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
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add delay if specified
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
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
  }, [threshold, rootMargin, delay]);

  const getAnimationClass = () => {
    const baseClass = `scroll-${animationType}`;
    const visibleClass = `scroll-${animationType}-visible`;
    return isVisible ? visibleClass : baseClass;
  };

  return {
    ref,
    isVisible,
    animationClass: getAnimationClass(),
  };
};

/**
 * Hook for multiple scroll animations in a list
 * @param length - Number of items to animate
 * @param options - Configuration options
 * @returns Function to get animation class for each item
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
  } = options;

  const refs = useRef<HTMLDivElement[]>([]);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(length).fill(false)
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    refs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
              });
            }, delay * index);
            observer.unobserve(el);
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
  }, [length, threshold, rootMargin, delay]);

  const getAnimationClass = (index: number) => {
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
