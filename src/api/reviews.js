import apiClient from './client';

const message = (error) =>
  error.response?.data?.message || error.message || '리뷰 요청을 처리하지 못했습니다.';

export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await apiClient.get(`/products/${productId}/reviews`, {
      params,
      skipAuth: true,
    });

    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const getSetReviews = async (productId, params = {}) => {
  try {
    const response = await apiClient.get(`/sets/${productId}/reviews`, {
      params,
      skipAuth: true,
    });

    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const getMyReviews = async () => {
  try {
    const response = await apiClient.get('/reviews/me');
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const getEligibleReviews = async () => {
  try {
    const response = await apiClient.get('/reviews/eligible');
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const createReview = async ({ orderItemId, rating, content }) => {
  try {
    const response = await apiClient.post('/reviews', { orderItemId, rating, content });
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const updateReview = async (reviewId, { rating, content }) => {
  try {
    const response = await apiClient.patch(`/reviews/${reviewId}`, { rating, content });
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};
