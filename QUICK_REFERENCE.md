# Quick Reference: Using Animations

## 🚀 Quick Start - 3 Options

### Option 1: Simplest (ScrollAnimationWrapper)
```tsx
import { ScrollAnimationWrapper } from '@/components/ScrollAnimationWrapper';

<ScrollAnimationWrapper animationType="slide-in-up">
  <YourContent />
</ScrollAnimationWrapper>
```

### Option 2: Using Hook
```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const MyComponent = () => {
  const { ref, animationClass } = useScrollAnimation({
    animationType: 'fade-in'
  });
  
  return <div ref={ref} className={animationClass}>Content</div>;
};
```

### Option 3: Tailwind Class (no animation on scroll, instant)
```tsx
<div className="animate-fade-in-up">Content</div>
```

---

## 📋 Animation Types

| Type | Effect |
|------|--------|
| `fade-in` | Opacity 0→1 |
| `slide-in-left` | X: -100% → 0 |
| `slide-in-right` | X: +100% → 0 |
| `slide-in-up` | Y: +20px → 0 |
| `slide-in-down` | Y: -20px → 0 |
| `scale-in` | Scale: 0.95 → 1 |

---

## ⚡ Common Patterns

### Hero Section
```tsx
<ScrollAnimationWrapper animationType="fade-in-down">
  <h1>Title</h1>
</ScrollAnimationWrapper>

<ScrollAnimationWrapper animationType="fade-in-up" delay={200}>
  <p>Subtitle</p>
</ScrollAnimationWrapper>
```

### Card Grid
```tsx
const { registerRef, getAnimationClass } = useScrollAnimationList(items.length);

{items.map((item, i) => (
  <Card
    ref={(el) => registerRef(i, el)}
    className={getAnimationClass(i)}
  >
    {item.content}
  </Card>
))}
```

### Two Column (Alternating)
```tsx
<ScrollAnimationWrapper animationType="slide-in-left">
  <div>Left column</div>
</ScrollAnimationWrapper>

<ScrollAnimationWrapper animationType="slide-in-right">
  <div>Right column</div>
</ScrollAnimationWrapper>
```

---

## 🔧 Key Options

```ts
{
  animationType: 'fade-in',      // Animation type
  threshold: 0.1,                // 0-1, when to trigger (default 0.1)
  delay: 0,                      // ms to delay
  rootMargin: '0px'              // trigger area margin
}
```

---

## 📱 Responsive Breakpoints

- `xs`: 375px (small phones) ← NEW!
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px (desktop)
- `xl`: 1280px
- `2xl`: 1536px

---

## 🎨 Using with Tailwind Classes

```tsx
// Instant animation on mount
<div className="animate-fade-in-up">
  Content appears with fade-in effect
</div>

// With delay
<div 
  className="animate-slide-in-left" 
  style={{ animationDelay: '100ms' }}
>
  Slides in from left
</div>
```

---

## 🔗 Files to Reference

- **ANIMATIONS_GUIDE.md** - Full documentation
- **CHANGES_SUMMARY.md** - What changed
- **src/components/ScrollAnimationExamples.tsx** - Working examples
- **src/hooks/useScrollAnimation.ts** - Hook source code

---

## ✅ Mobile Responsiveness

Navigation now works great on:
- ✅ 375px phones (iPhone SE)
- ✅ 640px phones (iPhone 12+)
- ✅ 768px tablets
- ✅ All desktop sizes

Hamburger menu:
- ✅ Fixed sizing
- ✅ Proper animations
- ✅ Auto-closes on navigation
- ✅ Responsive padding/spacing

---

## 🐛 Troubleshooting

**Animation not triggering?**
- Check ref is attached to DOM element
- Verify threshold value (0.1 = 10% visible)
- Check component isn't already past the viewport

**Performance issues?**
- Reduce number of animated items
- Increase threshold to delay animations
- Use `useScrollAnimationList` for multiple items

**Wrong breakpoint?**
- Check tailwind.config.ts for active screen sizes
- Use DevTools device emulation to test
- Remember `xs` is 375px

---

## 📚 Learn More

See **ANIMATIONS_GUIDE.md** for:
- Detailed API documentation
- Advanced examples
- Performance optimization
- Custom animation creation
