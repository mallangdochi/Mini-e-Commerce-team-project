import { create } from 'zustand';

import useAuthStore from '@/store/authStore';
import { getStoredWishlistItems, setStoredWishlistItems } from '@/utils/storage';

function getProductId(product) {
  const productId = Number(product?.productId ?? product?.id);
  return Number.isFinite(productId) ? productId : null;
}

function getWishlistProductId(item) {
  const productId = Number(
    item?.productId ?? item?.product?.productId ?? item?.product?.id ?? item?.id
  );

  return Number.isFinite(productId) ? productId : null;
}

function createWishlistItem(product) {
  const productId = getProductId(product);

  if (productId === null) {
    return null;
  }

  const createdAt = new Date().toISOString();

  return {
    wishlistId: `local-${productId}`,
    productId,
    createdAt,
    productCachedAt: Date.now(),
    product: {
      ...product,
      id: product?.id ?? productId,
      productId,
    },
  };
}

function persistWishlist(items) {
  const nextItems = Array.isArray(items) ? items : [];

  setStoredWishlistItems(nextItems);
  useAuthStore.getState().patchUserSummary({ wishlistCount: nextItems.length });

  return nextItems;
}

const initialItems = getStoredWishlistItems();

const useWishlistStore = create((set, get) => ({
  items: initialItems,

  syncFromStorage: () => {
    const items = getStoredWishlistItems();
    set({ items });
    useAuthStore.getState().patchUserSummary({ wishlistCount: items.length });
    return items;
  },

  addItem: (product) => {
    const nextItem = createWishlistItem(product);

    if (!nextItem) {
      throw new Error('상품 정보를 확인할 수 없습니다.');
    }

    const existing = get().items.find((item) => getWishlistProductId(item) === nextItem.productId);

    if (existing) {
      const nextItems = get().items.map((item) =>
        getWishlistProductId(item) === nextItem.productId
          ? {
              ...item,
              product: {
                ...(item.product ?? {}),
                ...nextItem.product,
              },
              productCachedAt: Date.now(),
            }
          : item
      );

      persistWishlist(nextItems);
      set({ items: nextItems });
      return existing;
    }

    const nextItems = [nextItem, ...get().items];
    persistWishlist(nextItems);
    set({ items: nextItems });
    return nextItem;
  },

  removeByProductId: (productId) => {
    const normalizedProductId = Number(productId);
    const nextItems = get().items.filter(
      (item) => getWishlistProductId(item) !== normalizedProductId
    );

    persistWishlist(nextItems);
    set({ items: nextItems });
    return nextItems;
  },

  removeByWishlistId: (wishlistId) => {
    const nextItems = get().items.filter((item) => String(item.wishlistId) !== String(wishlistId));

    persistWishlist(nextItems);
    set({ items: nextItems });
    return nextItems;
  },

  toggleItem: (product) => {
    const productId = getProductId(product);

    if (productId === null) {
      throw new Error('상품 정보를 확인할 수 없습니다.');
    }

    const isWishlisted = get().items.some((item) => getWishlistProductId(item) === productId);

    if (isWishlisted) {
      get().removeByProductId(productId);
      return false;
    }

    get().addItem(product);
    return true;
  },
}));

export default useWishlistStore;
