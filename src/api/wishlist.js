import apiClient from '@/api/client';

export const getWishlist = async () => {
  const response = await apiClient.get('/wishlist');
  return response.data;
};

export const addWishlist = async ({ productId, productType = 'product' }) => {
  const response = await apiClient.post('/wishlist', { productId, productType });
  return response.data;
};

export const removeWishlist = async (productId) => {
  const response = await apiClient.delete(`/wishlist/${productId}`);
  return response.data;
};
