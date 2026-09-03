import BannerCarousel from '@/components/home/BannerCarousel';
import BestSellerSection from '@/components/home/BestSellerSection';
import BrandStorySection from '@/components/home/BrandStorySection';
import CustomCarousel from '@/components/home/CustomCarousel';
import FeaturedLookSection from '@/components/home/FeaturedLookSection';
import Hero from '@/components/home/Hero';
import NewsletterSection from '@/components/home/NewsletterSection';
import TrendingSection from '@/components/home/TrendingSection';

function HomePage() {
  return (
    <>
      <Hero />

      <BannerCarousel />

      <CustomCarousel />

      <FeaturedLookSection />

      <BrandStorySection />

      <BestSellerSection />

      <TrendingSection />

      <NewsletterSection />
    </>
  );
}

export default HomePage;
