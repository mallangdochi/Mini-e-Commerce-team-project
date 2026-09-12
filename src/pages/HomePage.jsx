import { useEffect, useState } from 'react';

import { getBanners, getHomeData, getNewProducts } from '@/api/homeApi';
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

  const [banners, setBanners] = useState(null);
  const [isBannersLoading, setIsBannersLoading] = useState(true);
  const [bannersError, setBannersError] = useState(null);

  const [newProducts, setNewProducts] = useState(null);
  const [isNewProductsLoading, setIsNewProductsLoading] = useState(true);
  const [newProductsError, setNewProductsError] = useState(null);

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

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsBannersLoading(true);
        setBannersError(null);

        const response = await getBanners();

        if (!response.success) {
          throw new Error(response.message || '배너 정보를 불러오지 못했습니다.');
        }

        setBanners(response.data);
      } catch (error) {
        console.error('BANNERS API ERROR:', error);
        setBannersError('배너 정보를 불러오지 못했습니다.');
      } finally {
        setIsBannersLoading(false);
      }
    };

    loadBanners();
  }, []);

  useEffect(() => {
    const loadNewProducts = async () => {
      try {
        setIsNewProductsLoading(true);
        setNewProductsError(null);

        const response = await getNewProducts();

        if (!response.success) {
          throw new Error(response.message || '신상품 정보를 불러오지 못했습니다.');
        }

        setNewProducts(response.data);
      } catch (error) {
        console.error('NEW PRODUCTS API ERROR:', error);
        setNewProductsError('신상품 정보를 불러오지 못했습니다.');
      } finally {
        setIsNewProductsLoading(false);
      }
    };

    loadNewProducts();
  }, []);

  return (
    <>
      <Hero />

      <BannerCarousel slides={banners} isLoading={isBannersLoading} error={bannersError} />

      <CustomCarousel
        categories={newProducts}
        isLoading={isNewProductsLoading}
        error={newProductsError}
      />

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
