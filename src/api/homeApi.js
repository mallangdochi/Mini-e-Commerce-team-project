import apiClient from './client';

export const getHomeData = async () => {
  const response = await apiClient.get('/main');

  return response.data;
};

export const getBanners = async () => {
  const response = await apiClient.get('/main');

  return {
    ...response.data,
    data: response.data?.data?.banners ?? [],
  };
};

export const getBestSellers = async () => {
  const response = await apiClient.get('/products', {
    params: {
      sort: 'popular',
      page: 1,
      limit: 6,
    },
  });

  return {
    ...response.data,
    data: response.data?.data?.products ?? [],
  };
};

export const getNewProducts = async () => {
  const response = await apiClient.get('/products', {
    params: {
      sort: 'new',
      page: 1,
      limit: 3,
    },
  });

  return {
    ...response.data,
    data: response.data?.data?.products ?? [],
  };
};
