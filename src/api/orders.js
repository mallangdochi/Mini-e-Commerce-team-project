import apiClient from './client';

const getAccessToken = () => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    throw new Error('로그인이 필요합니다.');
  }

  return accessToken;
};

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAccessToken()}`,
  },
});

const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || '요청 처리 중 오류가 발생했습니다.';
};

export const createOrder = async ({ items, shipping, paymentMethod, couponId, pointsUsed = 0 }) => {
  try {
    const payload = {
      items,
      shipping,
      paymentMethod,
      pointsUsed,
    };

    if (couponId) {
      payload.couponId = couponId;
    }

    const response = await apiClient.post('/orders', payload, getAuthConfig());

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export const getOrders = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await apiClient.get('/orders', {
      ...getAuthConfig(),
      params: {
        page,
        limit,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export const getOrder = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`, getAuthConfig());

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`, {}, getAuthConfig());

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};
