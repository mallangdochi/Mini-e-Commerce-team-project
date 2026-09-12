import apiClient from './client';

export const getHomeData = async () => {
  const response = await apiClient.get('/main');

  return response.data;
};

export const getBanners = async () => {
  const response = await apiClient.get('/home/banners');

  return response.data;
};

export const getNewProducts = async () => {
  const response = await apiClient.get('/home/new-products');

  return response.data;
};
