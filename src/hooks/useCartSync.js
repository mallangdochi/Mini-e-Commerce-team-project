import { useEffect } from 'react';

import { subscribeToCartBroadcast, useCartStore } from '@/store/cartStore';
import { isCartStorageKey } from '@/utils/storage';

const AUTH_STORAGE_KEYS = new Set(['accessToken', 'userInfo']);

function useCartSync() {
  useEffect(() => {
    const syncCart = (options) => useCartStore.getState().syncCart(options);

    const unsubscribeBroadcast = subscribeToCartBroadcast((snapshot) => {
      useCartStore.getState().applyExternalSnapshot(snapshot);
    });

    const handleStorage = (event) => {
      if (isCartStorageKey(event.key)) {
        syncCart({ force: true, mergeGuest: false });
        return;
      }

      if (AUTH_STORAGE_KEYS.has(event.key)) {
        syncCart({ force: true, mergeGuest: true });
      }
    };

    const handleFocus = () => {
      syncCart({ force: true, mergeGuest: true });
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncCart({ force: true, mergeGuest: true });
      }
    };

    const handleAuthChange = () => {
      syncCart({ force: true, mergeGuest: true });
    };

    syncCart({ force: true, mergeGuest: true });

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('auth-change', handleAuthChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribeBroadcast();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('auth-change', handleAuthChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

export default useCartSync;
