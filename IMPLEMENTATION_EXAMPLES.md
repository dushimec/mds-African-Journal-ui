# Quick Implementation Guide - Copy & Paste Examples

Use these examples to quickly add animations to your pages. Just copy and adjust for your content.

---

## 1. Hero Section

```tsx
// pages/Home.tsx or any page

import { ScrollAnimationWrapper } from '@/components/ScrollAnimationWrapper';

export const HeroSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="container mx-auto max-w-4xl">
        {/* Title */}
        <ScrollAnimationWrapper 
          animationType="fade-in-down" 
          threshold={0.3}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to MAJAED
          </h1>
        </ScrollAnimationWrapper>

        {/* Subtitle */}
        <ScrollAnimationWrapper 
          animationType="fade-in-up" 
          delay={200}
          threshold={0.3}
        >
          <p className="text-xl text-muted-foreground mb-8">
            African Journal of Applied Economics and Development
          </p>
        </ScrollAnimationWrapper>

        {/* CTA Button */}
        <ScrollAnimationWrapper 
          animationType="scale-in" 
          delay={400}
          threshold={0.3}
        >
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90">
            Get Started
          </button>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};
```

---

## 2. Featured Articles Grid

```tsx
import { ScrollAnimationWrapper } from '@/components/ScrollAnimationWrapper';
import { useScrollAnimationList } from '@/hooks/useScrollAnimation';

interface Article {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  date: string;
}

export const FeaturedArticles = ({ articles }: { articles: Article[] }) => {
  const { registerRef, getAnimationClass } = useScrollAnimationList(
    articles.length,
    {
      animationType: 'slide-in-up',
      delay: 100, // Each article delays 100ms from previous
      threshold: 0.1,
    }
  );

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Title */}
        <ScrollAnimationWrapper animationType="fade-in-down" threshold={0.2}>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Featured Articles
          </h2>
        </ScrollAnimationWrapper>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <article
              key={article.id}
              ref={(el) => registerRef(index, el)}
              className={`card p-6 border rounded-lg hover:shadow-lg transition-shadow ${getAnimationClass(index)}`}
            >
              <h3 className="text-xl font-bold mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {article.authors}
              </p>
              <p className="text-sm mb-4 line-clamp-3">
                {article.abstract}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(article.date).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## 3. Two-Column Section (Alternating Animations)

```tsx
export const AboutSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Slides from left */}
          <ScrollAnimationWrapper 
            animationType="slide-in-left"
            threshold={0.2}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">About Our Journal</h2>
              <p className="text-muted-foreground">
                The African Journal of Applied Economics and Development
                publishes original research on economics and development
                issues relevant to Africa.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Peer-reviewed research</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Open access publication</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Global distribution</span>
                </li>
              </ul>
            </div>
          </ScrollAnimationWrapper>

          {/* Right Column - Slides from right */}
          <ScrollAnimationWrapper 
            animationType="slide-in-right"
            threshold={0.2}
          >
            <img
              src="/about-image.png"
              alt="About the journal"
              className="rounded-lg shadow-lg w-full"
            />
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
};
```

---

## 4. Feature Cards with Icons

```tsx
import { BookOpen, Globe, Users } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Quality Research',
      description: 'Peer-reviewed articles from leading researchers'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Published and accessible worldwide'
    },
    {
      icon: Users,
      title: 'Expert Editorial Board',
      description: 'Guidance from academic leaders'
    },
  ];

  const { registerRef, getAnimationClass } = useScrollAnimationList(
    features.length,
    { animationType: 'scale-in', delay: 150 }
  );

  return (
    <section className="py-20 px-4 bg-secondary/20">
      <div className="container mx-auto">
        <ScrollAnimationWrapper animationType="fade-in-down" threshold={0.2}>
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us
          </h2>
        </ScrollAnimationWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                ref={(el) => registerRef(index, el)}
                className={`text-center p-8 bg-card rounded-lg ${getAnimationClass(index)}`}
              >
                <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
```

---

## 5. Timeline/History Section

```tsx
export const TimelineSection = () => {
  const events = [
    { year: '2020', title: 'Founded', description: 'Journal launched' },
    { year: '2021', title: 'First Issue', description: 'Published first articles' },
    { year: '2022', title: 'Growth', description: 'Expanded to 2 issues per year' },
    { year: '2024', title: 'Global Recognition', description: 'Indexed internationally' },
  ];

  const { registerRef, getAnimationClass } = useScrollAnimationList(
    events.length,
    { animationType: 'slide-in-up', delay: 120 }
  );

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <ScrollAnimationWrapper animationType="fade-in-down" threshold={0.2}>
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Journey
          </h2>
        </ScrollAnimationWrapper>

        <div className="space-y-8">
          {events.map((event, index) => (
            <div
              key={event.year}
              ref={(el) => registerRef(index, el)}
              className={`flex gap-4 ${getAnimationClass(index)}`}
            >
              <div className="text-primary font-bold min-w-16">
                {event.year}
              </div>
              <div className="pb-8 border-l-2 border-primary pl-4">
                <h3 className="font-bold mb-1">{event.title}</h3>
                <p className="text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## 6. Testimonials Section

```tsx
export const TestimonialsSection = () => {
  const testimonials = [
    {
      id: '1',
      text: 'An excellent platform for publishing quality research.',
      author: 'Dr. Smith',
      role: 'Researcher'
    },
    {
      id: '2',
      text: 'The peer review process is thorough and fair.',
      author: 'Prof. Johnson',
      role: 'Editor'
    },
    {
      id: '3',
      text: 'Great visibility for African research.',
      author: 'Dr. Okonkwo',
      role: 'Author'
    },
  ];

  const { registerRef, getAnimationClass } = useScrollAnimationList(
    testimonials.length,
    { animationType: 'slide-in-left', delay: 100 }
  );

  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="container mx-auto">
        <ScrollAnimationWrapper animationType="fade-in-down" threshold={0.2}>
          <h2 className="text-3xl font-bold text-center mb-12">
            What Experts Say
          </h2>
        </ScrollAnimationWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              ref={(el) => registerRef(index, el)}
              className={`card p-6 rounded-lg border ${getAnimationClass(index)}`}
            >
              <p className="mb-4 italic">"{testimonial.text}"</p>
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## 7. Call-to-Action Section

```tsx
export const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto max-w-3xl">
        <ScrollAnimationWrapper animationType="fade-in-up" threshold={0.3}>
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Submit Your Research?
            </h2>
            <p className="text-lg opacity-90">
              Join thousands of researchers publishing with MAJAED
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-opacity-90">
                Submit Article
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10">
                Learn More
              </button>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};
```

---

## 8. How to Integrate into Your Home Page

```tsx
// pages/Home.tsx

import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedArticles } from '@/components/sections/FeaturedArticles';
import { AboutSection } from '@/components/sections/AboutSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';

export const Home = () => {
  return (
    <main>
      <HeroSection />
      <FeaturedArticles articles={/* your articles */} />
      <AboutSection />
      <FeaturesSection />
      <TimelineSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
};

export default Home;
```

---

## Tips & Tricks

1. **Adjust timing to your preference:**
   - `delay={100}` - Controls stagger timing between items
   - `threshold={0.1}` - Higher = triggers later (0-1 scale)

2. **Mix animation types:**
   - Alternate between slide-in-left and slide-in-right
   - Vary with scale-in and fade-in for visual interest

3. **Add custom styling:**
   - Combine with Tailwind classes: `className="hover:shadow-lg"`
   - Works perfectly with your existing CSS

4. **For performance:**
   - Use `useScrollAnimationList` for multiple items (not individual hooks)
   - Limit to 3-4 animated items per screen on mobile

5. **Mobile considerations:**
   - Animations still work great on mobile
   - Reduced motion is respected automatically
   - Performance is optimized for slower devices

---

Happy animating! 🎉
