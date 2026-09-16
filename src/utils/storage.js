const STORAGE_KEYS = {
  accessToken: 'accessToken',
  userInfo: 'userInfo',
  profileOverrides: 'arc-profile-overrides',
  mypageSummary: 'arc-mypage-summary',
  noticeSettings: 'arc-notice-settings',
  addresses: 'arc-addresses',
  orders: 'arc-orders-cache',
  orderDetails: 'arc-order-details-cache',
  wishlist: 'arc-wishlist-cache',
  reviews: 'arc-reviews',
  claims: 'arc-order-claims',
  inquiries: 'arc-inquiries',
  cancelReasons: 'arc-order-cancel-reasons',
  passwordChangeDraft: 'arc-password-change-draft',
  productSort: 'arc-product-sort',
};

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function readText(key) {
  return getStorage()?.getItem(key) ?? null;
}

function writeText(key, value) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(key, String(value));
}

function removeValue(key) {
  getStorage()?.removeItem(key);
}

function readJson(key, fallbackValue) {
  try {
    const rawValue = readText(key);

    if (rawValue === null) {
      return fallbackValue;
    }

    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  const storage = getStorage();

  if (!storage) {
    return value;
  }

  storage.setItem(key, JSON.stringify(value));
  return value;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export const getAccessToken = () => readText(STORAGE_KEYS.accessToken);

export const setAccessToken = (accessToken) => {
  if (!accessToken) {
    removeValue(STORAGE_KEYS.accessToken);
    return null;
  }

  writeText(STORAGE_KEYS.accessToken, accessToken);
  return accessToken;
};

export const getStoredUserInfo = () => {
  const value = readJson(STORAGE_KEYS.userInfo, null);
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
};

export const setStoredUserInfo = (user) => {
  if (!user) {
    removeValue(STORAGE_KEYS.userInfo);
    return null;
  }

  return writeJson(STORAGE_KEYS.userInfo, user);
};

export const getStoredProfileOverrides = () =>
  asObject(readJson(STORAGE_KEYS.profileOverrides, {}));

export const setStoredProfileOverrides = (profileOverrides) =>
  writeJson(STORAGE_KEYS.profileOverrides, asObject(profileOverrides));

export const getStoredSummary = () => asObject(readJson(STORAGE_KEYS.mypageSummary, {}));

export const updateStoredSummary = (partialSummary) => {
  const nextSummary = {
    ...getStoredSummary(),
    ...asObject(partialSummary),
  };

  return writeJson(STORAGE_KEYS.mypageSummary, nextSummary);
};

export const getStoredUser = () => {
  const userInfo = getStoredUserInfo();
  const profileOverrides = getStoredProfileOverrides();
  const summary = getStoredSummary();

  if (
    !userInfo &&
    Object.keys(profileOverrides).length === 0 &&
    Object.keys(summary).length === 0
  ) {
    return null;
  }

  return {
    ...(userInfo ?? {}),
    ...profileOverrides,
    ...summary,
  };
};

export const resolveUserProfile = (response) => {
  const remoteUser =
    response?.data?.user ?? response?.data ?? response?.user ?? response?.userInfo ?? {};

  return {
    ...asObject(remoteUser),
    ...getStoredProfileOverrides(),
    ...getStoredSummary(),
  };
};

export const clearAuthSessionStorage = () => {
  removeValue(STORAGE_KEYS.accessToken);
  removeValue(STORAGE_KEYS.userInfo);
};

export const getStoredNoticeSettings = () => asObject(readJson(STORAGE_KEYS.noticeSettings, {}));

export const setStoredNoticeSettings = (settings) =>
  writeJson(STORAGE_KEYS.noticeSettings, asObject(settings));

export const getStoredAddresses = () => asArray(readJson(STORAGE_KEYS.addresses, []));

export const setStoredAddresses = (addresses) =>
  writeJson(STORAGE_KEYS.addresses, asArray(addresses));

export const getStoredOrders = () => asArray(readJson(STORAGE_KEYS.orders, []));

export const setStoredOrders = (orders) => {
  const nextOrders = asArray(orders);
  writeJson(STORAGE_KEYS.orders, nextOrders);
  updateStoredSummary({ orderCount: nextOrders.length });
  return nextOrders;
};

export const getStoredOrderDetails = () => asObject(readJson(STORAGE_KEYS.orderDetails, {}));

export const setStoredOrderDetails = (details) =>
  writeJson(STORAGE_KEYS.orderDetails, asObject(details));

export const getStoredWishlistItems = () => asArray(readJson(STORAGE_KEYS.wishlist, []));

export const setStoredWishlistItems = (items) => {
  const nextItems = asArray(items);
  writeJson(STORAGE_KEYS.wishlist, nextItems);
  updateStoredSummary({ wishlistCount: nextItems.length });
  return nextItems;
};

export const getStoredReviews = () => asArray(readJson(STORAGE_KEYS.reviews, []));

export const setStoredReviews = (reviews) => writeJson(STORAGE_KEYS.reviews, asArray(reviews));

export const getStoredClaims = () => asArray(readJson(STORAGE_KEYS.claims, []));

export const setStoredClaims = (claims) => writeJson(STORAGE_KEYS.claims, asArray(claims));

export const getStoredInquiries = () => asArray(readJson(STORAGE_KEYS.inquiries, []));

export const setStoredInquiries = (inquiries) =>
  writeJson(STORAGE_KEYS.inquiries, asArray(inquiries));

export const getStoredCancelReasons = () => asObject(readJson(STORAGE_KEYS.cancelReasons, {}));

export const setStoredCancelReasons = (cancelReasons) =>
  writeJson(STORAGE_KEYS.cancelReasons, asObject(cancelReasons));

export const setStoredPasswordChangeDraft = (draft) =>
  writeJson(STORAGE_KEYS.passwordChangeDraft, asObject(draft));

export const getStoredProductSort = () => readText(STORAGE_KEYS.productSort);

export const setStoredProductSort = (sortType) => {
  if (!sortType) {
    removeValue(STORAGE_KEYS.productSort);
    return null;
  }

  writeText(STORAGE_KEYS.productSort, sortType);
  return sortType;
};
