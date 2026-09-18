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
  personalPrefix: 'arc-user-data-v1',
  legacyCart: 'arc-cart',
  cartPrefix: 'arc-cart-v2',
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

function getUserIdentity(user) {
  const source = asObject(user);

  const candidate =
    source.userId ??
    source.memberId ??
    source.loginId ??
    source.identifier ??
    source.id ??
    source.email ??
    source.username ??
    null;

  return candidate === null || candidate === undefined ? '' : String(candidate).trim();
}

function hashString(value) {
  let hash = 2166136261;
  const text = String(value ?? '');

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

export const getPersonalStorageOwnerId = (user = getStoredUserInfo()) => {
  const userIdentity = getUserIdentity(user);

  if (userIdentity) {
    return `user-${encodeURIComponent(userIdentity)}`;
  }

  const accessToken = getAccessToken();

  if (accessToken) {
    return `token-${hashString(accessToken)}`;
  }

  return 'guest';
};

export const getPersonalStorageKey = (baseKey, ownerId = getPersonalStorageOwnerId()) =>
  `${STORAGE_KEYS.personalPrefix}:${ownerId}:${baseKey}`;

function readPersonalJson(baseKey, fallbackValue, user) {
  const ownerId = getPersonalStorageOwnerId(user);
  return readJson(getPersonalStorageKey(baseKey, ownerId), fallbackValue);
}

function writePersonalJson(baseKey, value, user) {
  const ownerId = getPersonalStorageOwnerId(user);
  return writeJson(getPersonalStorageKey(baseKey, ownerId), value);
}

export const isPersonalStorageKey = (storageKey) =>
  Boolean(storageKey?.startsWith(`${STORAGE_KEYS.personalPrefix}:`));

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

export const getStoredProfileOverrides = (user = getStoredUserInfo()) =>
  asObject(readPersonalJson(STORAGE_KEYS.profileOverrides, {}, user));

export const setStoredProfileOverrides = (profileOverrides, user = getStoredUserInfo()) =>
  writePersonalJson(STORAGE_KEYS.profileOverrides, asObject(profileOverrides), user);

export const getStoredSummary = (user = getStoredUserInfo()) =>
  asObject(readPersonalJson(STORAGE_KEYS.mypageSummary, {}, user));

export const updateStoredSummary = (partialSummary, user = getStoredUserInfo()) => {
  const nextSummary = {
    ...getStoredSummary(user),
    ...asObject(partialSummary),
  };

  return writePersonalJson(STORAGE_KEYS.mypageSummary, nextSummary, user);
};

export const getStoredUser = () => {
  const userInfo = getStoredUserInfo();
  const profileOverrides = getStoredProfileOverrides(userInfo);
  const summary = getStoredSummary(userInfo);

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
  const normalizedRemoteUser = asObject(remoteUser);

  return {
    ...normalizedRemoteUser,
    ...getStoredProfileOverrides(normalizedRemoteUser),
    ...getStoredSummary(normalizedRemoteUser),
  };
};

export const clearAuthSessionStorage = () => {
  removeValue(STORAGE_KEYS.accessToken);
  removeValue(STORAGE_KEYS.userInfo);
};

export const getStoredNoticeSettings = () =>
  asObject(readPersonalJson(STORAGE_KEYS.noticeSettings, {}));

export const setStoredNoticeSettings = (settings) =>
  writePersonalJson(STORAGE_KEYS.noticeSettings, asObject(settings));

export const getStoredAddresses = () => asArray(readPersonalJson(STORAGE_KEYS.addresses, []));

export const setStoredAddresses = (addresses) =>
  writePersonalJson(STORAGE_KEYS.addresses, asArray(addresses));

export const getStoredOrders = () => asArray(readPersonalJson(STORAGE_KEYS.orders, []));

export const setStoredOrders = (orders) => {
  const nextOrders = asArray(orders);

  writePersonalJson(STORAGE_KEYS.orders, nextOrders);
  updateStoredSummary({ orderCount: nextOrders.length });

  return nextOrders;
};

export const getStoredOrderDetails = () =>
  asObject(readPersonalJson(STORAGE_KEYS.orderDetails, {}));

export const setStoredOrderDetails = (details) =>
  writePersonalJson(STORAGE_KEYS.orderDetails, asObject(details));

export const getStoredWishlistItems = () => asArray(readPersonalJson(STORAGE_KEYS.wishlist, []));

export const setStoredWishlistItems = (items) => {
  const nextItems = asArray(items);

  writePersonalJson(STORAGE_KEYS.wishlist, nextItems);
  updateStoredSummary({ wishlistCount: nextItems.length });

  return nextItems;
};

export const getStoredReviews = () => asArray(readPersonalJson(STORAGE_KEYS.reviews, []));

export const setStoredReviews = (reviews) =>
  writePersonalJson(STORAGE_KEYS.reviews, asArray(reviews));

export const getStoredClaims = () => asArray(readPersonalJson(STORAGE_KEYS.claims, []));

export const setStoredClaims = (claims) => writePersonalJson(STORAGE_KEYS.claims, asArray(claims));

export const getStoredInquiries = () => asArray(readPersonalJson(STORAGE_KEYS.inquiries, []));

export const setStoredInquiries = (inquiries) =>
  writePersonalJson(STORAGE_KEYS.inquiries, asArray(inquiries));

export const getStoredCancelReasons = () =>
  asObject(readPersonalJson(STORAGE_KEYS.cancelReasons, {}));

export const setStoredCancelReasons = (cancelReasons) =>
  writePersonalJson(STORAGE_KEYS.cancelReasons, asObject(cancelReasons));

export const setStoredPasswordChangeDraft = (draft) =>
  writePersonalJson(STORAGE_KEYS.passwordChangeDraft, asObject(draft));

export const getStoredProductSort = () => readText(STORAGE_KEYS.productSort);

export const setStoredProductSort = (sortType) => {
  if (!sortType) {
    removeValue(STORAGE_KEYS.productSort);
    return null;
  }

  writeText(STORAGE_KEYS.productSort, sortType);
  return sortType;
};

export const getCartOwnerId = () => getPersonalStorageOwnerId();

export const getCartStorageKey = (ownerId = getCartOwnerId()) => {
  return `${STORAGE_KEYS.cartPrefix}:${ownerId}`;
};

const normalizeCartSnapshot = (value, ownerId) => {
  const snapshot = asObject(value);

  return {
    ownerId,
    items: asArray(snapshot.items),
    updatedAt: Number(snapshot.updatedAt) || 0,
  };
};

const getLegacyCartItems = () => {
  const legacyValue = readJson(STORAGE_KEYS.legacyCart, null);

  if (!legacyValue) {
    return [];
  }

  if (Array.isArray(legacyValue)) {
    return legacyValue;
  }

  if (Array.isArray(legacyValue.items)) {
    return legacyValue.items;
  }

  return asArray(legacyValue.state?.items);
};

export const getStoredCartSnapshot = (ownerId = getCartOwnerId()) => {
  const storageKey = getCartStorageKey(ownerId);
  const storedValue = readJson(storageKey, null);

  if (storedValue !== null) {
    return normalizeCartSnapshot(storedValue, ownerId);
  }

  if (ownerId !== 'guest') {
    return {
      ownerId,
      items: [],
      updatedAt: 0,
    };
  }

  const legacyItems = getLegacyCartItems();

  if (legacyItems.length === 0) {
    return {
      ownerId,
      items: [],
      updatedAt: 0,
    };
  }

  const migratedSnapshot = {
    ownerId,
    items: legacyItems,
    updatedAt: Date.now(),
  };

  writeJson(storageKey, migratedSnapshot);
  removeValue(STORAGE_KEYS.legacyCart);

  return migratedSnapshot;
};

export const setStoredCartSnapshot = (snapshot) => {
  const ownerId = snapshot?.ownerId ?? getCartOwnerId();
  const nextSnapshot = {
    ownerId,
    items: asArray(snapshot?.items),
    updatedAt: Number(snapshot?.updatedAt) || Date.now(),
  };

  writeJson(getCartStorageKey(ownerId), nextSnapshot);
  return nextSnapshot;
};

export const clearStoredCartSnapshot = (ownerId = getCartOwnerId()) => {
  removeValue(getCartStorageKey(ownerId));
};

export const isCartStorageKey = (storageKey) => {
  if (!storageKey) {
    return false;
  }

  return (
    storageKey === STORAGE_KEYS.legacyCart || storageKey.startsWith(`${STORAGE_KEYS.cartPrefix}:`)
  );
};
