import BannerCarousel from '@/components/home/BannerCarousel';
import CustomCarousel from '@/components/home/CustomCarousel';
import Hero from '@/components/home/Hero';

function HomePage() {
  return (
    <>
      <Hero />

      <BannerCarousel />

      <CustomCarousel />
    </>
  );
}

export default HomePage;
