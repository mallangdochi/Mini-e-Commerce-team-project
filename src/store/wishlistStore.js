import { create } from 'zustand';

import { addWishlist, getWishlist, removeWishlist } from '@/api/wishlist';
import useAuthStore from '@/store/authStore';

const normalizeWishlistItem = (item) => {
  const productId = Number(item?.productId ?? item?.product?.productId ?? item?.product?.id);
  const product = item?.product ?? item;

  return {
    ...item,
    wishlistId: item?.wishlistId ?? item?.id ?? productId,
    productId,
    productType: item?.productType ?? product?.productType ?? 'product',
    createdAt: item?.addedAt ?? item?.createdAt ?? null,
    product: {
      ...product,
      productId,
      id: product?.id ?? productId,
    },
  };
};

const extractWishlistItems = (response) => {
  const data = response?.data ?? response ?? {};
  const items = Array.isArray(data) ? data : data?.items;
  return (Array.isArray(items) ? items : []).map(normalizeWishlistItem);
};

const updateWishlistCount = (items) => {
  useAuthStore.getState().patchUserSummary({ wishlistCount: items.length });
};

const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: false,
  errorMessage: '',

  loadWishlist: async ({ silent = false } = {}) => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;

    if (!isLoggedIn) {
      set({ items: [], isLoading: false, errorMessage: '' });
      updateWishlistCount([]);
      return [];
    }

    if (!silent) {
      set({ isLoading: true, errorMessage: '' });
    }

    try {
      const response = await getWishlist();
      const items = extractWishlistItems(response);
      set({ items, isLoading: false, errorMessage: '' });
      updateWishlistCount(items);
      return items;
    } catch (error) {
      set({ isLoading: false, errorMessage: error.message || '찜 목록을 불러오지 못했습니다.' });
      throw error;
    }
  },

  toggleItem: async (product) => {
    const productId = Number(product?.productId ?? product?.id);

    if (!Number.isFinite(productId)) {
      throw new Error('상품 정보를 확인할 수 없습니다.');
    }

    const productType =
      product?.productType === 'set' || product?.categoryId === 'sets' ? 'set' : 'product';
    const existing = get().items.find((item) => Number(item.productId) === productId);

    if (existing) {
      await removeWishlist(productId);
      const items = get().items.filter((item) => Number(item.productId) !== productId);
      set({ items, errorMessage: '' });
      updateWishlistCount(items);
      return false;
    }

    const response = await addWishlist({ productId, productType });
    const serverItem = response?.data ?? {};
    const item = normalizeWishlistItem({
      ...serverItem,
      productId,
      productType,
      product: {
        ...product,
        productId,
        id: product?.id ?? productId,
        productType,
      },
    });
    const items = [item, ...get().items.filter((entry) => Number(entry.productId) !== productId)];
    set({ items, errorMessage: '' });
    updateWishlistCount(items);
    return true;
  },

  removeByProductId: async (productId) => {
    const normalizedId = Number(productId);

    if (!Number.isFinite(normalizedId)) {
      throw new Error('상품 정보를 확인할 수 없습니다.');
    }

    await removeWishlist(normalizedId);
    const items = get().items.filter((item) => Number(item.productId) !== normalizedId);
    set({ items, errorMessage: '' });
    updateWishlistCount(items);
    return items;
  },

  clear: () => {
    set({ items: [], isLoading: false, errorMessage: '' });
    updateWishlistCount([]);
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('auth-change', () => {
    const state = useAuthStore.getState();

    if (state.isLoggedIn) {
      void useWishlistStore
        .getState()
        .loadWishlist({ silent: true })
        .catch(() => {});
    } else {
      useWishlistStore.getState().clear();
    }
  });
}

export default useWishlistStore;
