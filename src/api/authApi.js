import apiClient from './client';

export const login = async ({ id, identifier, password }) => {
  try {
    const response = await apiClient.post('/auth/login', {
      identifier: identifier ?? id,
      password,
    });

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

export const getStoredUser = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') ?? 'null');
    const overrides = JSON.parse(localStorage.getItem('arc-profile-overrides') ?? '{}');
    const summary = JSON.parse(localStorage.getItem('arc-mypage-summary') ?? '{}');

    if (!userInfo && Object.keys(overrides).length === 0 && Object.keys(summary).length === 0) {
      return null;
    }

    return {
      ...(userInfo ?? {}),
      ...overrides,
      ...summary,
    };
  } catch {
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userInfo');
  window.dispatchEvent(new Event('auth-change'));
};

export const resolveUserProfile = (response) => {
  const remote =
    response?.data?.user ?? response?.data ?? response?.user ?? response?.userInfo ?? {};

  return {
    ...(remote ?? {}),
    ...(getStoredUser() ?? {}),
  };
};

export const updateStoredSummary = (partialSummary) => {
  try {
    const current = JSON.parse(localStorage.getItem('arc-mypage-summary') ?? '{}');
    const next = {
      ...current,
      ...partialSummary,
    };

    localStorage.setItem('arc-mypage-summary', JSON.stringify(next));
    return next;
  } catch {
    return partialSummary;
  }
};

export const getStoredOrders = () => {
  try {
    const value = JSON.parse(localStorage.getItem('arc-orders-cache') ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const setStoredOrders = (orders) => {
  const nextOrders = Array.isArray(orders) ? orders : [];
  localStorage.setItem('arc-orders-cache', JSON.stringify(nextOrders));
  updateStoredSummary({ orderCount: nextOrders.length });
  return nextOrders;
};

export const getStoredOrderDetails = () => {
  try {
    const value = JSON.parse(localStorage.getItem('arc-order-details-cache') ?? '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
};

export const setStoredOrderDetails = (details) => {
  const nextDetails =
    details && typeof details === 'object' && !Array.isArray(details) ? details : {};
  localStorage.setItem('arc-order-details-cache', JSON.stringify(nextDetails));
  return nextDetails;
};

export const getStoredWishlistItems = () => {
  try {
    const value = JSON.parse(localStorage.getItem('arc-wishlist-cache') ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const setStoredWishlistItems = (items) => {
  const nextItems = Array.isArray(items) ? items : [];
  localStorage.setItem('arc-wishlist-cache', JSON.stringify(nextItems));
  updateStoredSummary({ wishlistCount: nextItems.length });
  return nextItems;
};
