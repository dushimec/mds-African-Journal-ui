import { useEffect, useRef, useState } from 'react';

interface UseStaggeredAnimationOptions {
  itemDelay?: number;
  containerDelay?: number;
  disabled?: boolean;
}

/**
 * Hook for staggered animations with sequential reveals
 * Perfect for card grids, lists, and other repeating elements
 * @param length - Number of items to animate
 * @param options - Configuration for stagger timing
 * @returns Object with methods to register refs and get animation data
 */
export const useStaggeredAnimation = (
  length: number,
  options: UseStaggeredAnimationOptions = {}
) => {
  const {
    itemDelay = 100,
    containerDelay = 0,
    disabled = false,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>(new Array(length).fill(null));
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
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

  // Setup intersection observers for each item
  useEffect(() => {
    if (disabled || prefersReducedMotion) {
      // Show all items immediately if animations are disabled
      setVisibleIndices(new Set(Array.from({ length }, (_, i) => i)));
      return;
    }

    const observers: IntersectionObserver[] = [];
    const timeouts: NodeJS.Timeout[] = [];

    itemRefs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Calculate stagger delay for this item
            const delay = containerDelay + index * itemDelay;

            const timeoutId = setTimeout(() => {
              setVisibleIndices((prev) => new Set(prev).add(index));
            }, delay);

            timeouts.push(timeoutId);
            observer.unobserve(el);
          }
        },
        {
          threshold: 0.05,
          rootMargin: '50px',
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [length, itemDelay, containerDelay, disabled, prefersReducedMotion]);

  const registerRef = (index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  };

  const isVisible = (index: number) => visibleIndices.has(index);

  const getStaggerStyle = (index: number) => {
    const visible = isVisible(index);
    const delay = containerDelay + index * itemDelay;

    if (prefersReducedMotion || disabled) {
      return {
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'none',
      };
    }

    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
    };
  };

  return {
    containerRef,
    registerRef,
    isVisible,
    getStaggerStyle,
    prefersReducedMotion,
  };
};

/**
 * Hook for reveal animations based on container visibility
 * Animates children in sequence when container enters viewport
 */
export const useRevealAnimation = (
  itemCount: number,
  options: UseStaggeredAnimationOptions = {}
) => {
  const {
    itemDelay = 80,
    containerDelay = 0,
    disabled = false,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerVisible, setContainerVisible] = useState(false);
  const [revealedItems, setRevealedItems] = useState<Set<number>>(new Set());
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

  // Watch for container visibility
  useEffect(() => {
    if (disabled || prefersReducedMotion) {
      setContainerVisible(true);
      setRevealedItems(new Set(Array.from({ length: itemCount }, (_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !containerVisible) {
          setContainerVisible(true);

          // Stagger reveal of children
          const timeouts: NodeJS.Timeout[] = [];
          for (let i = 0; i < itemCount; i++) {
            const timeoutId = setTimeout(() => {
              setRevealedItems((prev) => new Set(prev).add(i));
            }, containerDelay + i * itemDelay);
            timeouts.push(timeoutId);
          }

          observer.unobserve(entry.target);

          return () => {
            timeouts.forEach((timeout) => clearTimeout(timeout));
          };
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [itemCount, itemDelay, containerDelay, disabled, prefersReducedMotion, containerVisible]);

  const getItemStyle = (index: number) => {
    const isRevealed = revealedItems.has(index);
    const delay = containerDelay + index * itemDelay;

    if (prefersReducedMotion || disabled) {
      return {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
        transition: 'none',
      };
    }

    return {
      opacity: isRevealed ? 1 : 0,
      transform: isRevealed ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
      transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
    };
  };

  return {
    containerRef,
    getItemStyle,
    isRevealed: (index: number) => revealedItems.has(index),
    prefersReducedMotion,
  };
};
