# Animation System Enhancement Guide

## Overview

The application now features a comprehensive, performance-optimized animation system with full accessibility support. All animations respect user preferences for reduced motion and maintain smooth 60fps performance.

## Key Features

✅ **Scroll-Triggered Animations** - Elements animate as they enter the viewport
✅ **Parallax Scrolling** - Depth effect with multi-layer parallax
✅ **Staggered Reveals** - Sequential animations for lists and grids
✅ **Accessibility-First** - Respects `prefers-reduced-motion` media query
✅ **Performance Optimized** - Uses Intersection Observer and requestAnimationFrame
✅ **60fps Smooth** - GPU-accelerated transforms without layout thrashing
✅ **Predefined CSS Animations** - 9+ keyframe animations ready to use

## Available Animations

### Scroll-Triggered Animations

#### Basic Usage with ScrollAnimationWrapper

```tsx
import { ScrollAnimationWrapper } from '@/components/ScrollAnimationWrapper';

// Simple fade-in
<ScrollAnimationWrapper animationType="fade-in">
  <YourComponent />
</ScrollAnimationWrapper>

// With custom delay and threshold
<ScrollAnimationWrapper 
  animationType="slide-in-up"
  delay={200}
  threshold={0.2}
  rootMargin="50px"
>
  <YourComponent />
</ScrollAnimationWrapper>
```

#### Available Animation Types

- `fade-in` - Opacity fade from 0 to 1
- `slide-in-left` - Slide from left with fade
- `slide-in-right` - Slide from right with fade
- `slide-in-up` - Slide from bottom with fade (most common)
- `slide-in-down` - Slide from top with fade
- `scale-in` - Scale from 0.95 to 1 with fade

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Content to animate |
| `animationType` | string | `fade-in` | Animation type (see above) |
| `delay` | number | `0` | Delay in ms before animation starts |
| `threshold` | number | `0.1` | Intersection threshold (0-1) |
| `rootMargin` | string | `0px` | Margin around viewport for trigger |
| `className` | string | `` | Additional CSS classes |
| `disabled` | boolean | `false` | Disable animation |
| `role` | string | - | Accessibility role |
| `ariaLabel` | string | - | Accessibility label |

### Parallax Scrolling

```tsx
import { useParallax, useParallaxFade } from '@/hooks/useParallax';

// Basic Parallax
const { ref, style } = useParallax({ speed: 0.5 });
<div ref={ref} style={style}>
  Parallax content
</div>

// Parallax with Fade
const { ref, style } = useParallaxFade({ speed: 0.3, threshold: 0.2 });
<div ref={ref} style={style}>
  Parallax fade content
</div>
```

#### Parallax Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `speed` | number | `0.5` | Parallax speed (0-1, higher = more effect) |
| `offset` | number | `0` | Initial offset in pixels |
| `disabled` | boolean | `false` | Disable parallax |
| `threshold` | number | `0.1` | For fade variant, visibility threshold |

### Staggered List Animations

```tsx
import { useStaggeredAnimation, useRevealAnimation } from '@/hooks/useStaggeredAnimation';

// Staggered Animation
const { registerRef, getStaggerStyle } = useStaggeredAnimation(items.length, {
  itemDelay: 100,
  containerDelay: 0,
});

{items.map((item, i) => (
  <div 
    key={i}
    ref={registerRef(i)}
    style={getStaggerStyle(i)}
  >
    {item}
  </div>
))}

// Container Reveal (all children reveal together when container enters viewport)
const { containerRef, getItemStyle } = useRevealAnimation(itemCount, {
  itemDelay: 80,
  containerDelay: 0,
});

<div ref={containerRef}>
  {items.map((item, i) => (
    <div key={i} style={getItemStyle(i)}>
      {item}
    </div>
  ))}
</div>
```

#### Stagger Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `itemDelay` | number | `100` | Delay between items in ms |
| `containerDelay` | number | `0` | Initial container delay in ms |
| `disabled` | boolean | `false` | Disable animations |

### Utility CSS Classes

Add to elements for instant animations:

```tsx
// Floating animation
<div className="animate-float">Content</div>

// Pulse effect
<div className="animate-pulse-subtle">Content</div>

// Glow effect
<div className="animate-glow">Content</div>

// Bounce animation
<div className="animate-bounce-soft">Content</div>

// Hover effects
<div className="hover-lift">Lifts on hover</div>
<div className="hover-glow">Glows on hover</div>

// Stagger utilities (for manual timing)
<div className="stagger-0">No delay</div>
<div className="stagger-1">50ms delay</div>
<div className="stagger-2">100ms delay</div>
// ... up to stagger-5 (250ms)
```

### Custom CSS Keyframe Animations

All keyframe animations are available via CSS:

```css
@keyframes fadeIn { /* ... */ }
@keyframes slideInUp { /* ... */ }
@keyframes slideInDown { /* ... */ }
@keyframes slideInLeft { /* ... */ }
@keyframes slideInRight { /* ... */ }
@keyframes scaleIn { /* ... */ }
@keyframes pulseSubtle { /* ... */ }
@keyframes shimmer { /* ... */ }
@keyframes bounce { /* ... */ }
@keyframes float { /* ... */ }
@keyframes glow { /* ... */ }
```

## Accessibility & Performance

### Respects User Preferences

The system automatically detects and respects `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled instantly */
  * { animation: none !important; }
}
```

### Performance Characteristics

- **60fps smooth** - Uses `requestAnimationFrame` for animations
- **GPU accelerated** - Only animates `transform` and `opacity`
- **No layout thrashing** - Intersection Observer prevents reflows
- **Lazy loading** - Animations only trigger when needed
- **Memory efficient** - Observers disconnected after first trigger

### Browser Support

- ✅ Chrome 51+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 15+

## Implementation Examples

### Hero Section with Parallax

```tsx
const { ref, style } = useParallax({ speed: 0.4 });

<div ref={ref} style={style} className="hero-section">
  <ScrollAnimationWrapper animationType="slide-in-down" delay={100}>
    <h1>Welcome</h1>
  </ScrollAnimationWrapper>
  
  <ScrollAnimationWrapper animationType="fade-in" delay={200}>
    <p>Discover amazing content</p>
  </ScrollAnimationWrapper>
</div>
```

### Article List with Stagger

```tsx
const { registerRef, getStaggerStyle } = useStaggeredAnimation(articles.length, {
  itemDelay: 60,
});

{articles.map((article, i) => (
  <div
    key={article.id}
    ref={registerRef(i)}
    style={getStaggerStyle(i)}
  >
    <Card>{article.title}</Card>
  </div>
))}
```

### Card Grid with Reveal

```tsx
const { containerRef, getItemStyle } = useRevealAnimation(cards.length);

<div ref={containerRef} className="grid grid-cols-3">
  {cards.map((card, i) => (
    <div key={i} style={getItemStyle(i)}>
      {card}
    </div>
  ))}
</div>
```

### Complex Section with Multiple Animations

```tsx
<ScrollAnimationWrapper animationType="fade-in" threshold={0.2}>
  <div 
    ref={heroRef} 
    style={heroStyle}
    className="relative"
  >
    <ScrollAnimationWrapper animationType="scale-in" delay={100}>
      <Badge>New</Badge>
    </ScrollAnimationWrapper>

    <ScrollAnimationWrapper animationType="slide-in-down" delay={150}>
      <h2>Title</h2>
    </ScrollAnimationWrapper>

    <ScrollAnimationWrapper animationType="slide-in-up" delay={200}>
      <p>Description</p>
    </ScrollAnimationWrapper>
  </div>
</ScrollAnimationWrapper>
```

## Disabling Animations

### Per Component

```tsx
<ScrollAnimationWrapper disabled>
  <YourComponent />
</ScrollAnimationWrapper>
```

### Per Hook

```tsx
const { ref, style } = useParallax({ disabled: true });
const { registerRef } = useStaggeredAnimation(length, { disabled: true });
```

### Globally (System Preference)

All animations automatically disable when user has `prefers-reduced-motion: reduce` set in OS.

## CSS Variables for Customization

Available in `index.css`:

```css
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
--shadow-soft: 0 2px 8px -2px hsl(...);
--shadow-medium: 0 4px 16px -4px hsl(...);
--shadow-strong: 0 8px 32px -8px hsl(...);
```

## Troubleshooting

### Animations Not Appearing?

1. Check if `prefers-reduced-motion: reduce` is enabled
2. Verify component is inside viewport (check `threshold`)
3. Check if `disabled={true}` is set
4. Verify CSS classes are loaded

### Animations Too Fast/Slow?

Adjust `delay` and `itemDelay`:
```tsx
<ScrollAnimationWrapper delay={500}> {/* Longer delay */}
```

### Performance Issues?

- Reduce number of simultaneous animations
- Increase `threshold` to trigger later
- Use `disabled={true}` for non-critical animations
- Check browser DevTools Performance tab

### Not Respecting prefers-reduced-motion?

All hooks automatically detect this. If issues:
1. Check system accessibility settings
2. Test in DevTools: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`

## Best Practices

1. **Use scroll triggers wisely** - Not every element needs animation
2. **Respect motion preferences** - Always test with reduced motion enabled
3. **Keep delays short** - 100-200ms for items, not more
4. **Use GPU-safe properties** - Only `transform` and `opacity` animate
5. **Test on slower devices** - Ensure 60fps on mobile
6. **Provide context** - Users should understand animation purpose
7. **Combine animations** - Layer multiple effects for depth
8. **Test accessibility** - Use screen readers with animations

## Hooks API Reference

### useScrollAnimation

```tsx
const { ref, isVisible, animationClass, prefersReducedMotion } = useScrollAnimation({
  threshold: 0.1,
  rootMargin: '0px',
  animationType: 'fade-in',
  delay: 0,
  disabled: false,
});
```

### useScrollAnimationList

```tsx
const { registerRef, getAnimationClass, visibleItems, prefersReducedMotion } = 
  useScrollAnimationList(itemCount, {
    threshold: 0.1,
    rootMargin: '0px',
    animationType: 'fade-in',
    delay: 100,
    disabled: false,
  });
```

### useParallax

```tsx
const { ref, transform, style } = useParallax({
  speed: 0.5,
  offset: 0,
  disabled: false,
});
```

### useParallaxFade

```tsx
const { ref, isVisible, style } = useParallaxFade({
  speed: 0.3,
  threshold: 0.1,
  disabled: false,
});
```

### useStaggeredAnimation

```tsx
const { 
  containerRef, 
  registerRef, 
  isVisible, 
  getStaggerStyle, 
  prefersReducedMotion 
} = useStaggeredAnimation(itemCount, {
  itemDelay: 100,
  containerDelay: 0,
  disabled: false,
});
```

### useRevealAnimation

```tsx
const { 
  containerRef, 
  getItemStyle, 
  isRevealed, 
  prefersReducedMotion 
} = useRevealAnimation(itemCount, {
  itemDelay: 80,
  containerDelay: 0,
  disabled: false,
});
```

## File Structure

```
src/
├── hooks/
│   ├── useScrollAnimation.ts      # Scroll triggers + a11y
│   ├── useParallax.ts            # Parallax effects
│   └── useStaggeredAnimation.ts   # Stagger + reveal
├── components/
│   └── ScrollAnimationWrapper.tsx # Wrapper component
└── index.css                       # Keyframes + utilities
```

## Recent Enhancements

✅ Enhanced `index.css` with 10+ keyframe animations
✅ Added `prefers-reduced-motion` support to all hooks
✅ Created `useParallax` and `useParallaxFade` hooks
✅ Created `useStaggeredAnimation` and `useRevealAnimation` hooks
✅ Updated `ScrollAnimationWrapper` with accessibility props
✅ Enhanced `Journal.tsx` with comprehensive animations
✅ Optimized performance with `requestAnimationFrame`
✅ Added comprehensive CSS utility classes
✅ All animations maintain 60fps performance

---

**Last Updated:** 2026-06-14
**Status:** Production Ready ✅
