import { useCallback, useEffect } from 'react';

import useWishlistStore from '@/store/wishlistStore';

function useWishlist() {
  const wishlistItems = useWishlistStore((state) => state.items);
  const isLoading = useWishlistStore((state) => state.isLoading);
  const errorMessage = useWishlistStore((state) => state.errorMessage);
  const loadWishlistStore = useWishlistStore((state) => state.loadWishlist);
  const removeByProductId = useWishlistStore((state) => state.removeByProductId);

  useEffect(() => {
    void loadWishlistStore().catch(() => {});
  }, [loadWishlistStore]);

  const loadWishlist = useCallback(
    async (options) => loadWishlistStore(options),
    [loadWishlistStore]
  );

  const removeWishlistItem = useCallback(
    async (productId) => removeByProductId(productId),
    [removeByProductId]
  );

  return {
    wishlistItems,
    errorMessage,
    isLoading,
    loadWishlist,
    removeWishlistItem,
  };
}

export default useWishlist;
