import apiClient from './client';

const message = (error) =>
  error.response?.data?.message || error.message || '배송지 요청을 처리하지 못했습니다.';

export const getAddresses = async () => {
  try {
    const response = await apiClient.get('/addresses');
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const createAddress = async (payload) => {
  try {
    const response = await apiClient.post('/addresses', payload);
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const updateAddress = async (addressId, payload) => {
  try {
    const response = await apiClient.patch(`/addresses/${addressId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await apiClient.delete(`/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await apiClient.patch(`/addresses/${addressId}/default`);
    return response.data;
  } catch (error) {
    throw new Error(message(error), { cause: error });
  }
};
