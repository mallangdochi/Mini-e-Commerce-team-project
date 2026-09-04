import { useEffect, useState } from 'react';

import { getHomeData } from '@/api/homeApi';
import BannerCarousel from '@/components/home/BannerCarousel';
import BestSellerSection from '@/components/home/BestSellerSection';
import BrandStorySection from '@/components/home/BrandStorySection';
import CustomCarousel from '@/components/home/CustomCarousel';
import FeaturedLookSection from '@/components/home/FeaturedLookSection';
import Hero from '@/components/home/Hero';
import NewsletterSection from '@/components/home/NewsletterSection';
import TrendingSection from '@/components/home/TrendingSection';

function HomePage() {
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getHomeData();

        if (!response.success) {
          throw new Error(response.message || '메인 페이지 정보를 불러오지 못했습니다.');
        }

        setHomeData(response.data);
      } catch (error) {
        console.error('HOME API ERROR:', error);
        setError('메인 페이지 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <>
      <Hero />

      <BannerCarousel />

      <CustomCarousel />

      <FeaturedLookSection />

      <BrandStorySection data={homeData?.brandStory} isLoading={isLoading} error={error} />

      <BestSellerSection
        products={homeData?.bestSellers ?? []}
        isLoading={isLoading}
        error={error}
      />

      <TrendingSection items={homeData?.trending ?? []} isLoading={isLoading} error={error} />

      <NewsletterSection data={homeData?.newsletter} isLoading={isLoading} error={error} />
    </>
  );
}

export default HomePage;
