import apiClient from './client';

export const getHomeData = async () => {
  const response = await apiClient.get('/main');

  return response.data;
};
