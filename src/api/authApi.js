import apiClient from './client';

export const login = async ({ id, identifier, password }) => {
  try {
    const normalizedIdentifier = String(identifier ?? id ?? '').trim();
    const normalizedPassword = String(password ?? '').trim();

    const response = await apiClient.post(
      '/auth/login',
      {
        identifier: normalizedIdentifier,
        password: normalizedPassword,
      },
      {
        skipAuth: true,
      }
    );

    const result = response.data;

    return {
      ...result,
      token: result?.data?.token ?? result?.token,
      userInfo: result?.data?.user ?? result?.userInfo,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';

    throw new Error(message, {
      cause: error,
    });
  }
};

export const checkIdAvailability = async (loginId) => {
  try {
    const response = await apiClient.post(
      '/auth/check-id',
      {
        loginId: String(loginId ?? '').trim(),
      },
      {
        skipAuth: true,
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || '아이디 중복확인을 완료하지 못했습니다. 다시 시도해 주세요.';

    throw new Error(message, {
      cause: error,
    });
  }
};

export const checkEmailAvailability = async (email) => {
  try {
    const response = await apiClient.post(
      '/auth/check-email',
      {
        email: String(email ?? '').trim(),
      },
      {
        skipAuth: true,
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || '이메일 중복확인을 완료하지 못했습니다. 다시 시도해 주세요.';

    throw new Error(message, {
      cause: error,
    });
  }
};

export const signup = async (signupData) => {
  try {
    const normalizedSignupData = {
      loginId: String(signupData?.loginId ?? '').trim(),
      email: String(signupData?.email ?? '').trim(),
      password: String(signupData?.password ?? '').trim(),
      name: String(signupData?.name ?? '').trim(),
      phone: String(signupData?.phone ?? '').trim(),
      postcode: String(signupData?.postcode ?? '').trim(),
      address: String(signupData?.address ?? '').trim(),
      detailAddress: String(signupData?.detailAddress ?? '').trim(),
      agreeTerms: Boolean(signupData?.agreeTerms),
      agreePrivacy: Boolean(signupData?.agreePrivacy),
      agreeMarketing: Boolean(signupData?.agreeMarketing),
    };

    const response = await apiClient.post('/auth/signup', normalizedSignupData, {
      skipAuth: true,
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || '회원가입을 완료하지 못했습니다. 다시 시도해 주세요.';

    throw new Error(message, {
      cause: error,
    });
  }
};

export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me');

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || '로그인 정보를 확인할 수 없습니다.';

    throw new Error(message, {
      cause: error,
    });
  }
};

export const updateMe = async ({ email, name, phone }) => {
  try {
    const response = await apiClient.patch('/auth/me', {
      email: String(email ?? '').trim(),
      name: String(name ?? '').trim(),
      phone: String(phone ?? '').replace(/[^\d]/g, ''),
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || '회원 정보를 수정하지 못했습니다.';
    throw new Error(message, { cause: error });
  }
};

export const verifyPassword = async (password) => {
  try {
    const response = await apiClient.post('/auth/verify-password', { password });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || '비밀번호를 확인하지 못했습니다.';
    throw new Error(message, { cause: error });
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await apiClient.patch('/auth/password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || '비밀번호를 변경하지 못했습니다.';
    throw new Error(message, { cause: error });
  }
};
