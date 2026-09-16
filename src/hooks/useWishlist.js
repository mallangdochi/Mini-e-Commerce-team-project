import { useCallback, useEffect, useState } from 'react';

import { getProduct, getSet } from '@/api/products';
import { getWishlist, removeWishlist } from '@/api/wishlist';
import useAuthStore from '@/store/authStore';
import { getStoredWishlistItems, setStoredWishlistItems } from '@/utils/storage';

const PRODUCT_CACHE_TTL = 5 * 60 * 1000;
const pendingProductRequests = new Map();

function getWishlistItems(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.wishlist)) return data.wishlist;

  return [];
}

function getProductId(item) {
  const productId = Number(
    item?.productId ?? item?.product?.productId ?? item?.product?.id ?? item?.id
  );
  return Number.isFinite(productId) ? productId : null;
}

function getWishlistId(item, productId) {
  return item?.id ?? item?.wishlistId ?? item?.wishId ?? String(productId);
}

function getCachedWishlistMap() {
  return new Map(
    getStoredWishlistItems()
      .map((item) => [Number(item?.productId), item])
      .filter(([productId]) => Number.isFinite(productId))
  );
}

function isCacheFresh(item) {
  const cachedAt = Number(item?.productCachedAt ?? 0);

  return cachedAt > 0 && Date.now() - cachedAt < PRODUCT_CACHE_TTL;
}

async function requestProduct(productId) {
  if (pendingProductRequests.has(productId)) {
    return pendingProductRequests.get(productId);
  }

  const request = (async () => {
    try {
      const response = await getProduct(productId);
      return response?.data ?? response;
    } catch {
      try {
        const response = await getSet(productId);
        return response?.data ?? response;
      } catch {
        return null;
      }
    }
  })();

  pendingProductRequests.set(productId, request);

  try {
    return await request;
  } finally {
    pendingProductRequests.delete(productId);
  }
}

async function resolveWishlistProduct(item, cachedItem, productId) {
  if (item?.product && typeof item.product === 'object') {
    return {
      product: item.product,
      productCachedAt: Date.now(),
    };
  }

  if (cachedItem?.product && isCacheFresh(cachedItem)) {
    return {
      product: cachedItem.product,
      productCachedAt: cachedItem.productCachedAt,
    };
  }

  const product = await requestProduct(productId);

  if (!product) {
    return null;
  }

  return {
    product,
    productCachedAt: Date.now(),
  };
}

async function fetchWishlistPageData() {
  const response = await getWishlist();
  const rawWishlist = getWishlistItems(response);
  const cachedWishlistMap = getCachedWishlistMap();

  const productResults = await Promise.all(
    rawWishlist.map(async (item) => {
      const productId = getProductId(item);

      if (productId === null) {
        return null;
      }

      const cachedItem = cachedWishlistMap.get(productId);
      const resolved = await resolveWishlistProduct(item, cachedItem, productId);

      if (!resolved) {
        return null;
      }

      return {
        wishlistId: getWishlistId(item, productId),
        productId,
        createdAt: item.createdAt ?? item.created_at ?? cachedItem?.createdAt ?? null,
        product: resolved.product,
        productCachedAt: resolved.productCachedAt,
      };
    })
  );

  return productResults.filter(Boolean);
}

function useWishlist() {
  const patchUserSummary = useAuthStore((state) => state.patchUserSummary);
  const [wishlistItems, setWishlistItems] = useState(() => getStoredWishlistItems());
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      try {
        const items = await fetchWishlistPageData();

        if (!isActive) {
          return;
        }

        setWishlistItems(items);
        setStoredWishlistItems(items);
      } catch (error) {
        if (isActive) {
          setErrorMessage(error.message || '찜한 상품을 불러오지 못했습니다.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    patchUserSummary({ wishlistCount: wishlistItems.length });
  }, [patchUserSummary, wishlistItems.length]);

  const loadWishlist = useCallback(async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      const items = await fetchWishlistPageData();
      setWishlistItems(items);
      setStoredWishlistItems(items);
      return items;
    } catch (error) {
      setErrorMessage(error.message || '찜한 상품을 불러오지 못했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeWishlistItem = useCallback(async (wishlistId) => {
    await removeWishlist(wishlistId);

    setWishlistItems((prev) => {
      const next = prev.filter((item) => item.wishlistId !== wishlistId);
      setStoredWishlistItems(next);
      return next;
    });
  }, []);

  return {
    wishlistItems,
    errorMessage,
    isLoading,
    loadWishlist,
    removeWishlistItem,
  };
}

export default useWishlist;
