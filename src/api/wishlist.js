import apiClient from '@/api/client';

export const getWishlist = async () => {
  const response = await apiClient.get('/wishlist');

  return response.data;
};

export const addWishlist = async (productId) => {
  const response = await apiClient.post('/wishlist', {
    productId,
  });

  return response.data;
};

export const removeWishlist = async (wishlistId) => {
  const response = await apiClient.delete(`/wishlist/${wishlistId}`);

  return response.data;
};
