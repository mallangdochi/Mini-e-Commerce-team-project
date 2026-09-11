import apiClient from '@/api/client';

export async function getNewProducts() {
  const response = await apiClient.get('/rest/v1/경로');

  return response.data;
}
