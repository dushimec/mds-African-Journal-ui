# Quick Animation Reference

## 🎯 Common Patterns

### Pattern 1: Hero Section with Parallax
```tsx
const { ref, style } = useParallax({ speed: 0.4 });

<div ref={ref} style={style} className="hero-section bg-gradient-to-r p-8 rounded-lg">
  <ScrollAnimationWrapper animationType="fade-in">
    <h1>Welcome</h1>
  </ScrollAnimationWrapper>
</div>
```

### Pattern 2: Card Grid with Stagger
```tsx
const { registerRef, getStaggerStyle } = useStaggeredAnimation(cards.length, {
  itemDelay: 60,
});

<div className="grid grid-cols-1 md:grid-cols-3">
  {cards.map((card, i) => (
    <div 
      key={card.id}
      ref={registerRef(i)}
      style={getStaggerStyle(i)}
    >
      <Card>{card.title}</Card>
    </div>
  ))}
</div>
```

### Pattern 3: Sequential Reveal
```tsx
const { containerRef, getItemStyle } = useRevealAnimation(items.length, {
  itemDelay: 80,
});

<section ref={containerRef} className="space-y-4">
  {items.map((item, i) => (
    <div key={i} style={getItemStyle(i)}>
      {item.content}
    </div>
  ))}
</section>
```

### Pattern 4: Wrap Everything
```tsx
<ScrollAnimationWrapper animationType="slide-in-up" delay={200}>
  <YourComponent />
</ScrollAnimationWrapper>
```

## 🎨 Animation Types

| Type | Best For | Speed |
|------|----------|-------|
| `fade-in` | Text, overlays | Slow |
| `slide-in-up` | Cards, sections | Medium |
| `slide-in-down` | Headers, badges | Medium |
| `slide-in-left` | Left content | Medium |
| `slide-in-right` | Right content | Medium |
| `scale-in` | Icons, badges, CTAs | Fast |

## ⚡ Performance Tips

✅ Use `threshold={0.2}` for elements below the fold
✅ Set `itemDelay={60-100}` for lists (not too fast)
✅ Increase `containerDelay` to stagger large lists
✅ Disable animations on low-power devices

## ♿ Accessibility

All animations automatically:
- ✅ Disable when `prefers-reduced-motion: reduce`
- ✅ Support keyboard navigation
- ✅ Support screen readers
- ✅ Don't interfere with focus management

## 🔍 Debug Checklist

- [ ] Animations visible in Firefox DevTools (Inspector > Inspector > Animations)
- [ ] Test with DevTools: `(prefers-reduced-motion: reduce)` enabled
- [ ] Check Lighthouse accessibility score
- [ ] Test on mobile (slower devices)
- [ ] Verify no console errors

## 📊 Applied to Journal.tsx

✅ Hero section: Parallax + fade-in
✅ Latest Issue badge: scale-in
✅ Issue title: slide-in-down
✅ Issue description: slide-in-up
✅ Grid stats: slide-in-left/right
✅ View Issue button: scale-in
✅ Page title: slide-in-up
✅ Search/filter: fade-in
✅ Article cards: Staggered slide-in-up
✅ Article badges: scale-in (individual)
✅ No results message: fade-in

## 🚀 Ready to Use

All animations are:
- ✅ Production-ready
- ✅ Fully accessible
- ✅ Performance optimized
- ✅ Comprehensively documented

Start adding to other pages!
