import BannerCarousel from '@/components/home/BannerCarousel';
import CustomCarousel from '@/components/home/CustomCarousel';
import FeaturedLookSection from '@/components/home/FeaturedLookSection';
import Hero from '@/components/home/Hero';

function HomePage() {
  return (
    <>
      <Hero />

      <BannerCarousel />

      <CustomCarousel />

      <FeaturedLookSection />
    </>
  );
}

export default HomePage;
