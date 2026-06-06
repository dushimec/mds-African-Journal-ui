/**
 * Example: Using Scroll Animations in Home Page
 * 
 * This file shows how to integrate scroll animations into sections.
 * Copy these patterns to add animations to your components.
 */

import { ScrollAnimationWrapper } from '@/components/ScrollAnimationWrapper';
import { useScrollAnimationList } from '@/hooks/useScrollAnimation';

// Example 1: Simple wrapper usage
export const HeroSectionExample = () => {
  return (
    <section className="py-20 px-4">
      <ScrollAnimationWrapper 
        animationType="fade-in-down" 
        threshold={0.3}
      >
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Our Journal
        </h1>
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper 
        animationType="fade-in-up" 
        delay={200}
        threshold={0.3}
      >
        <p className="text-xl text-muted-foreground">
          Discover innovative research and academic excellence
        </p>
      </ScrollAnimationWrapper>
    </section>
  );
};

// Example 2: Cards with staggered animations
interface CardData {
  id: string;
  title: string;
  description: string;
  icon?: any;
}

export const CardGridExample = ({ cards }: { cards: CardData[] }) => {
  const { registerRef, getAnimationClass } = useScrollAnimationList(
    cards.length,
    {
      animationType: 'slide-in-up',
      delay: 100, // Each card delays 100ms
      threshold: 0.1,
    }
  );

  return (
    <section className="py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.id}
            ref={(el) => registerRef(index, el)}
            className={`card p-6 rounded-lg border ${getAnimationClass(index)}`}
          >
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// Example 3: Two-column layout with alternating animations
export const AltSectionExample = () => {
  return (
    <section className="py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left column - slides in from left */}
        <ScrollAnimationWrapper 
          animationType="slide-in-left"
          threshold={0.2}
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Section Title</h2>
            <p className="text-muted-foreground">
              Your content here...
            </p>
          </div>
        </ScrollAnimationWrapper>

        {/* Right column - slides in from right */}
        <ScrollAnimationWrapper 
          animationType="slide-in-right"
          threshold={0.2}
        >
          <img 
            src="/placeholder.png" 
            alt="Example" 
            className="rounded-lg"
          />
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

// Example 4: Using scale-in for emphasis
export const FeatureHighlightExample = () => {
  return (
    <section className="py-20 text-center">
      <ScrollAnimationWrapper 
        animationType="scale-in"
        threshold={0.3}
        delay={100}
      >
        <div className="inline-block">
          <div className="bg-primary text-primary-foreground p-12 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Key Highlight</h2>
            <p className="text-lg">This element scales in when visible</p>
          </div>
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
};

// Example 5: Complex layout with multiple animations
export const ComplexLayoutExample = () => {
  const features = [
    { id: '1', title: 'Feature 1', description: 'Description 1' },
    { id: '2', title: 'Feature 2', description: 'Description 2' },
    { id: '3', title: 'Feature 3', description: 'Description 3' },
    { id: '4', title: 'Feature 4', description: 'Description 4' },
  ];

  const { registerRef, getAnimationClass } = useScrollAnimationList(
    features.length,
    { animationType: 'fade-in-up', delay: 80 }
  );

  return (
    <section className="py-20">
      <ScrollAnimationWrapper animationType="fade-in-down">
        <h2 className="text-4xl font-bold text-center mb-16">
          Our Features
        </h2>
      </ScrollAnimationWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            ref={(el) => registerRef(index, el)}
            className={`p-6 border rounded-lg hover:shadow-lg transition-shadow ${getAnimationClass(index)}`}
          >
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// How to use these examples in your actual components:
/*
import { HeroSectionExample, CardGridExample } from '@/components/ScrollAnimationExamples';

export const Home = () => {
  const sampleCards = [
    { id: '1', title: 'Card 1', description: 'Description' },
    { id: '2', title: 'Card 2', description: 'Description' },
    { id: '3', title: 'Card 3', description: 'Description' },
  ];

  return (
    <main>
      <HeroSectionExample />
      <CardGridExample cards={sampleCards} />
      <AltSectionExample />
      <ComplexLayoutExample />
    </main>
  );
};
*/
