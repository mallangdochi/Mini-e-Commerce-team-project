import apiClient from './client';

const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || '쿠폰 정보를 불러오지 못했습니다.';
};

export const getCoupons = async () => {
  try {
    const response = await apiClient.get('/coupons');

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};
