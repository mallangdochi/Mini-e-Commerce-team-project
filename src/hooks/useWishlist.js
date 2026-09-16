import { useCallback, useEffect } from 'react';

import useWishlistStore from '@/store/wishlistStore';

function useWishlist() {
  const wishlistItems = useWishlistStore((state) => state.items);
  const syncFromStorage = useWishlistStore((state) => state.syncFromStorage);
  const removeByWishlistId = useWishlistStore((state) => state.removeByWishlistId);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  const loadWishlist = useCallback(async () => syncFromStorage(), [syncFromStorage]);

  const removeWishlistItem = useCallback(
    async (wishlistId) => {
      removeByWishlistId(wishlistId);
    },
    [removeByWishlistId]
  );

  return {
    wishlistItems,
    errorMessage: '',
    isLoading: false,
    loadWishlist,
    removeWishlistItem,
  };
}

export default useWishlist;
