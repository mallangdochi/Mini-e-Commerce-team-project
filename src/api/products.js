import apiClient from '@/api/client';

export const getCategories = async () => {
  const response = await apiClient.get('/categories');

  return response.data;
};

export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/products', {
    params,
  });

  return response.data;
};

export const getProductFilters = async (params = {}) => {
  const response = await apiClient.get('/products/filters', {
    params,
  });

  return response.data;
};

export const getProduct = async (productId) => {
  const response = await apiClient.get(`/products/${productId}`);

  return response.data;
};

export const searchProducts = async (params = {}) => {
  const response = await apiClient.get('/search', {
    params,
  });

  return response.data;
};

export const getSets = async (params = {}) => {
  const response = await apiClient.get('/sets', {
    params,
  });

  return response.data;
};

export const getSet = async (productId) => {
  const response = await apiClient.get(`/sets/${productId}`);

  return response.data;
};
