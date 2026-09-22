import { useEffect, useRef, useState } from 'react';

interface UseParallaxOptions {
  speed?: number;
  offset?: number;
  disabled?: boolean;
}

/**
 * Hook for parallax scroll effects
 * Creates a smooth depth effect by translating elements based on scroll position
 * @param options - Configuration for parallax
 * @returns Object with ref and transform value
 */
export const useParallax = (options: UseParallaxOptions = {}) => {
  const {
    speed = 0.5,
    offset = 0,
    disabled = false,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (disabled || prefersReducedMotion || !ref.current) return;

    let rafId: number;
    
    const handleScroll = () => {
      if (!ref.current) return;

      const elementRect = ref.current.getBoundingClientRect();
      const elementMiddle = elementRect.top + elementRect.height / 2;
      const viewportMiddle = window.innerHeight / 2;
      
      // Calculate distance from viewport center
      const distance = (viewportMiddle - elementMiddle) * speed + offset;
      
      // Use requestAnimationFrame for smooth 60fps performance
      rafId = requestAnimationFrame(() => {
        setTransform(distance);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed, offset, disabled, prefersReducedMotion]);

  return {
    ref,
    transform,
    style: prefersReducedMotion || disabled ? {} : {
      transform: `translateY(${transform}px)`,
    },
  };
};

/**
 * Hook for fade-in on scroll with parallax depth effect
 * Combines fade and parallax for enhanced visual engagement
 */
export const useParallaxFade = (
  options: UseParallaxOptions & { threshold?: number } = {}
) => {
  const {
    speed = 0.3,
    threshold = 0.1,
    disabled = false,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [transform, setTransform] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection Observer for visibility
  useEffect(() => {
    if (disabled || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, disabled, prefersReducedMotion]);

  // Parallax scroll effect
  useEffect(() => {
    if (disabled || prefersReducedMotion || !ref.current || !isVisible) return;

    let rafId: number;

    const handleScroll = () => {
      if (!ref.current) return;

      const elementRect = ref.current.getBoundingClientRect();
      const distance = elementRect.top * speed;

      rafId = requestAnimationFrame(() => {
        setTransform(distance);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed, isVisible, disabled, prefersReducedMotion]);

  return {
    ref,
    isVisible,
    style: prefersReducedMotion || disabled ? {} : {
      opacity: isVisible ? 1 : 0,
      transform: `translateY(${transform}px)`,
      transition: isVisible ? 'opacity 0.8s ease-out' : 'none',
    },
  };
};
