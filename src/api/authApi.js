import apiClient from './client';

export const login = async ({ id, password }) => {
  try {
    const response = await apiClient.post('/auth/login', {
      id,
      password,
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';

    throw new Error(message, {
      cause: error,
    });
  }
};

export const checkIdAvailability = async (id) => {
  try {
    const response = await apiClient.get('/auth/check-id', { params: { id } });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || '아이디 중복확인을 완료하지 못했습니다. 다시 시도해 주세요.';
    throw new Error(message, { cause: error });
  }
};

export const signup = async (signupData) => {
  try {
    const response = await apiClient.post('/auth/signup', signupData);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || '회원가입을 완료하지 못했습니다. 다시 시도해 주세요.';
    throw new Error(message, { cause: error });
  }
};

export const getMe = async (token) => {
  try {
    const response = await apiClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || '로그인 정보를 확인할 수 없습니다.';

    throw new Error(message, {
      cause: error,
    });
  }
};
