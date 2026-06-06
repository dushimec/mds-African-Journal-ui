# Animation Guide

This document explains how to use the scroll animations and entrance/exit animations in the MDS African Journal UI project.

## 1. Scroll Animations (triggered when element comes into view)

### Using the ScrollAnimationWrapper Component (Easiest)

```tsx
import { ScrollAnimationWrapper } from '@/components/ScrollAnimationWrapper';

export const MyComponent = () => {
  return (
    <ScrollAnimationWrapper animationType="slide-in-up">
      <div className="card">
        <h2>This will slide in from bottom</h2>
        <p>When this element comes into view</p>
      </div>
    </ScrollAnimationWrapper>
  );
};
```

### Using the useScrollAnimation Hook (Manual Control)

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const MyComponent = () => {
  const { ref, animationClass, isVisible } = useScrollAnimation({
    animationType: 'fade-in',
    threshold: 0.2, // Trigger when 20% is visible
    delay: 100,      // 100ms delay
  });

  return (
    <div ref={ref} className={animationClass}>
      <h2>This will fade in</h2>
    </div>
  );
};
```

### Using the useScrollAnimationList Hook (For Lists)

```tsx
import { useScrollAnimationList } from '@/hooks/useScrollAnimation';

export const ArticleList = ({ articles }: { articles: Article[] }) => {
  const { registerRef, getAnimationClass } = useScrollAnimationList(
    articles.length,
    {
      animationType: 'slide-in-left',
      delay: 80, // Each item delays 80ms from the previous
    }
  );

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <div
          key={article.id}
          ref={(el) => registerRef(index, el)}
          className={getAnimationClass(index)}
        >
          <h3>{article.title}</h3>
          <p>{article.description}</p>
        </div>
      ))}
    </div>
  );
};
```

## 2. Animation Types

### Available Scroll Animations:
- `fade-in` - Fades element in
- `slide-in-left` - Slides in from left
- `slide-in-right` - Slides in from right
- `slide-in-up` - Slides in from bottom
- `slide-in-down` - Slides in from top
- `scale-in` - Scales from smaller to full size

## 3. Direct CSS Classes (For Manual Styling)

You can also use the CSS classes directly:

```tsx
export const MyComponent = () => {
  return (
    <div className="scroll-fade-in">
      <h2>This will fade in on scroll</h2>
    </div>
  );
};
```

### Available CSS Classes:
- `.scroll-fade-in` / `.scroll-fade-in-visible`
- `.scroll-slide-in-left` / `.scroll-slide-in-left-visible`
- `.scroll-slide-in-right` / `.scroll-slide-in-right-visible`
- `.scroll-slide-in-up` / `.scroll-slide-in-up-visible`
- `.scroll-slide-in-down` / `.scroll-slide-in-down-visible`
- `.scroll-scale-in` / `.scroll-scale-in-visible`

## 4. Built-in Tailwind Animations (No JavaScript Needed)

Use these for simple animations that don't need scroll triggers:

```tsx
// Animate on mount
<div className="animate-fade-in-up">
  <h2>Fades in and slides up</h2>
</div>

// Slide from left to right
<div className="animate-slide-in-right">
  <p>Content slides in from right</p>
</div>

// Other options:
// animate-slide-in-left
// animate-slide-out-left
// animate-slide-out-right
// animate-fade-in-up
// animate-fade-in-down
// animate-fade-out-up
// animate-fade-out-down
// animate-scale-in
// animate-bounce-slow
```

## 5. Scroll Direction Detection

Automatically show/hide navbar based on scroll direction:

```tsx
import { useScrollDirection } from '@/hooks/useScrollAnimation';

export const Navbar = () => {
  const scrollDirection = useScrollDirection(); // 'up' or 'down'

  return (
    <nav className={scrollDirection === 'down' ? 'hide' : 'show'}>
      {/* Navigation content */}
    </nav>
  );
};
```

## 6. Configuration Options

### Hook Options:
```ts
interface UseScrollAnimationOptions {
  threshold?: number;        // 0-1, how much of element must be visible (default: 0.1)
  rootMargin?: string;       // Add margin to trigger area (default: '0px')
  animationType?: string;    // Which animation to use (default: 'fade-in')
  delay?: number;            // Milliseconds to delay animation (default: 0)
}
```

## 7. Examples for Home Page Sections

### Hero Section with animations:
```tsx
import { ScrollAnimationWrapper } from '@/components/ScrollAnimationWrapper';

export const HeroSection = () => {
  return (
    <section className="hero py-20">
      <ScrollAnimationWrapper animationType="fade-in-down" threshold={0.5}>
        <h1 className="text-4xl font-bold">Welcome to MAJAED</h1>
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper animationType="fade-in-up" delay={200}>
        <p className="text-xl">African Journal of Applied Economics and Development</p>
      </ScrollAnimationWrapper>
    </section>
  );
};
```

### Featured Articles with staggered animations:
```tsx
export const FeaturedArticles = ({ articles }: { articles: Article[] }) => {
  const { registerRef, getAnimationClass } = useScrollAnimationList(
    articles.length,
    { animationType: 'slide-in-up', delay: 100 }
  );

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.map((article, idx) => (
        <article
          key={article.id}
          ref={(el) => registerRef(idx, el)}
          className={`card p-6 ${getAnimationClass(idx)}`}
        >
          <h3>{article.title}</h3>
        </article>
      ))}
    </section>
  );
};
```

## 8. Responsive Design

All animations work seamlessly with responsive design starting from 375px:
- Animations are GPU-accelerated for smooth performance
- Reduced motion respected via prefers-reduced-motion media query
- Mobile-optimized animations that don't cause jank

## 9. Performance Tips

1. Use `threshold` wisely - higher threshold = animation triggers later
2. Use `useScrollAnimationList` for multiple items (more efficient than individual hooks)
3. Animations use CSS transitions for performance
4. Avoid animating too many elements at once on slow devices
5. Use `delay` strategically for staggered effects without overwhelming performance

## 10. Customization

### Modify animation speeds in tailwind.config.ts:
```ts
animation: {
  "fade-in-up": "fade-in-up 0.5s ease-out", // Change 0.5s to desired duration
  // ... other animations
}
```

### Create custom animations in index.css:
```css
@layer components {
  .scroll-custom-animation {
    @apply opacity-0 rotate-12 transition-all duration-700 ease-out;
  }

  .scroll-custom-animation-visible {
    @apply opacity-100 rotate-0;
  }
}
```

Then use:
```tsx
<ScrollAnimationWrapper animationType="custom-animation">
  <div>Rotates and fades in</div>
</ScrollAnimationWrapper>
```
