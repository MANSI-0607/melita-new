import Header from '@/components/Header';
import TopStrip from '@/components/TopStrip';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ProductShowcase from '@/components/ProductShowcase';
import SkinQuiz from '@/components/SkinQuiz';
import WhyMelita from '@/components/WhyMelita';
import LatestBlogs from '@/components/LatestBlogs';
import JourneyPhilosophy from '@/components/JourneyPhilosophy';
import InstagramSection from '@/components/InstagramSection';
import ReviewsSection from '@/components/ReviewsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopStrip />
      <Header />
      <main>
        <Hero />
        <Features />
        <ProductShowcase />
        <SkinQuiz />
        <WhyMelita />
        <LatestBlogs />
        <JourneyPhilosophy />
        <InstagramSection />
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;