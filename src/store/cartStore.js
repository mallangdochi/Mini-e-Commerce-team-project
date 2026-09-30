import { create } from 'zustand';

import {
  addRemoteCartItem,
  clearRemoteCart,
  getCartItemKey,
  getRemoteCartItems,
  mergeGuestCartToRemote,
  removeRemoteCartItem,
  removeRemoteCartItems,
  setRemoteCartItemQuantity,
} from '@/api/cart';
import {
  clearStoredCartSnapshot,
  getAccessToken,
  getCartOwnerId,
  getStoredCartSnapshot,
  setStoredCartSnapshot,
} from '@/utils/storage';

const CART_CHANNEL_NAME = 'arc-cart-sync-v1';
const TAB_ID =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

let cartChannel = null;
let remoteWriteQueue = Promise.resolve();
let pendingRemoteSync = null;

const normalizeItems = (items) => (Array.isArray(items) ? items : []);

const getChannel = () => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  if (!cartChannel) {
    cartChannel = new BroadcastChannel(CART_CHANNEL_NAME);
  }

  return cartChannel;
};

const broadcastSnapshot = (snapshot) => {
  getChannel()?.postMessage({
    type: 'CART_UPDATED',
    sourceId: TAB_ID,
    snapshot,
  });
};

const mergeCartItems = (baseItems, incomingItems) => {
  const merged = new Map();

  for (const item of [...normalizeItems(baseItems), ...normalizeItems(incomingItems)]) {
    const id = getCartItemKey(item);
    const normalizedItem = {
      ...item,
      id,
      quantity: Math.max(1, Number(item.quantity) || 1),
    };

    const existing = merged.get(id);

    if (!existing) {
      merged.set(id, normalizedItem);
      continue;
    }

    const stock = Number(existing.stock ?? normalizedItem.stock);
    const maxQuantity = Number.isFinite(stock) && stock > 0 ? stock : Number.MAX_SAFE_INTEGER;

    merged.set(id, {
      ...existing,
      ...normalizedItem,
      id,
      quantity: Math.min(maxQuantity, existing.quantity + normalizedItem.quantity),
    });
  }

  return [...merged.values()];
};

const createSnapshot = ({ ownerId, items, previousUpdatedAt = 0 }) => ({
  ownerId,
  items: normalizeItems(items),
  updatedAt: Math.max(Date.now(), Number(previousUpdatedAt) + 1),
});

const isLoggedInOwner = (ownerId = getCartOwnerId()) => {
  return ownerId !== 'guest' && Boolean(getAccessToken());
};

const initialSnapshot = getStoredCartSnapshot();

export const useCartStore = create((set, get) => {
  const applySnapshot = (snapshot, { persist = true, broadcast = false } = {}) => {
    const normalizedSnapshot = {
      ownerId: snapshot.ownerId,
      items: normalizeItems(snapshot.items),
      updatedAt: Number(snapshot.updatedAt) || Date.now(),
    };

    if (persist) {
      setStoredCartSnapshot(normalizedSnapshot);
    }

    set({
      ownerId: normalizedSnapshot.ownerId,
      items: normalizedSnapshot.items,
      lastSyncedAt: normalizedSnapshot.updatedAt,
    });

    if (broadcast) {
      broadcastSnapshot(normalizedSnapshot);
    }

    return normalizedSnapshot.items;
  };

  const commitLocalItems = (items, ownerId = getCartOwnerId(), { broadcast = true } = {}) => {
    const state = get();
    const snapshot = createSnapshot({
      ownerId,
      items,
      previousUpdatedAt: state.lastSyncedAt,
    });

    return applySnapshot(snapshot, {
      persist: true,
      broadcast,
    });
  };

  const ensureCurrentOwner = () => {
    const currentOwnerId = getCartOwnerId();
    const state = get();

    if (state.ownerId === currentOwnerId) {
      return state;
    }

    const nextSnapshot = getStoredCartSnapshot(currentOwnerId);

    applySnapshot(nextSnapshot, {
      persist: false,
      broadcast: false,
    });

    return get();
  };

  const refreshRemoteCart = async ({ broadcast = true } = {}) => {
    const currentOwnerId = getCartOwnerId();

    if (!isLoggedInOwner(currentOwnerId)) {
      return get().items;
    }

    const remoteItems = await getRemoteCartItems();
    const snapshot = createSnapshot({
      ownerId: currentOwnerId,
      items: remoteItems,
      previousUpdatedAt: get().lastSyncedAt,
    });

    applySnapshot(snapshot, {
      persist: true,
      broadcast,
    });

    set({
      syncError: '',
    });

    return remoteItems;
  };

  const queueRemoteMutation = (mutation) => {
    remoteWriteQueue = remoteWriteQueue
      .then(async () => {
        await mutation();
        await refreshRemoteCart();
      })
      .catch(async (error) => {
        set({
          syncError: error?.message || '장바구니 동기화 중 오류가 발생했습니다.',
        });

        try {
          await refreshRemoteCart();
        } catch {
          return;
        }
      });

    return remoteWriteQueue;
  };

  const getMatchedOrderedItems = (cartItems, orderItems) => {
    const normalizedOrderItems = normalizeItems(orderItems);

    return cartItems.filter((cartItem) => {
      return normalizedOrderItems.some((orderItem) => {
        if (orderItem.id && cartItem.id === orderItem.id) {
          return true;
        }

        return (
          Number(cartItem.productId) === Number(orderItem.productId) &&
          (cartItem.productType ?? 'product') === (orderItem.productType ?? 'product') &&
          String(cartItem.color || '') === String(orderItem.color || '') &&
          String(cartItem.size || '') === String(orderItem.size || '')
        );
      });
    });
  };

  return {
    ownerId: initialSnapshot.ownerId,
    items: initialSnapshot.items,
    lastSyncedAt: initialSnapshot.updatedAt,
    isSyncing: false,
    syncError: '',

    addItem: (item) => {
      const state = ensureCurrentOwner();
      const nextItems = mergeCartItems(state.items, [item]);

      commitLocalItems(nextItems, state.ownerId);

      if (!isLoggedInOwner(state.ownerId)) {
        return;
      }

      void queueRemoteMutation(() => addRemoteCartItem(item));
    },

    updateQuantity: (itemId, quantity) => {
      const state = ensureCurrentOwner();
      const targetItem = state.items.find((item) => item.id === itemId);

      if (!targetItem) {
        return;
      }

      const stock = Number(targetItem.stock);
      const maxQuantity = Number.isFinite(stock) && stock > 0 ? stock : Number.MAX_SAFE_INTEGER;
      const nextQuantity = Math.min(maxQuantity, Math.max(1, Number(quantity) || 1));

      const nextItems = state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item
      );

      commitLocalItems(nextItems, state.ownerId);

      if (!isLoggedInOwner(state.ownerId)) {
        return;
      }

      void queueRemoteMutation(() => setRemoteCartItemQuantity(targetItem, nextQuantity));
    },

    removeItem: (itemId) => {
      const state = ensureCurrentOwner();
      const targetItem = state.items.find((item) => item.id === itemId);

      if (!targetItem) {
        return;
      }

      commitLocalItems(
        state.items.filter((item) => item.id !== itemId),
        state.ownerId
      );

      if (!isLoggedInOwner(state.ownerId)) {
        return;
      }

      void queueRemoteMutation(() => removeRemoteCartItem(targetItem));
    },

    removeItems: (itemIds) => {
      const state = ensureCurrentOwner();
      const targetIds = new Set(itemIds);
      const targetItems = state.items.filter((item) => targetIds.has(item.id));

      commitLocalItems(
        state.items.filter((item) => !targetIds.has(item.id)),
        state.ownerId
      );

      if (!isLoggedInOwner(state.ownerId) || targetItems.length === 0) {
        return;
      }

      void queueRemoteMutation(() => removeRemoteCartItems(targetItems));
    },

    removeOrderedItems: (orderItems) => {
      const state = ensureCurrentOwner();
      const targetItems = getMatchedOrderedItems(state.items, orderItems);

      if (targetItems.length === 0) {
        return;
      }

      const targetIds = new Set(targetItems.map((item) => item.id));

      commitLocalItems(
        state.items.filter((item) => !targetIds.has(item.id)),
        state.ownerId
      );

      if (!isLoggedInOwner(state.ownerId)) {
        return;
      }

      void queueRemoteMutation(() => removeRemoteCartItems(targetItems));
    },

    clearCart: () => {
      const state = ensureCurrentOwner();

      commitLocalItems([], state.ownerId);

      if (!isLoggedInOwner(state.ownerId)) {
        return;
      }

      void queueRemoteMutation(() => clearRemoteCart());
    },

    syncCart: async ({ force = false, mergeGuest = true } = {}) => {
      if (pendingRemoteSync) {
        return pendingRemoteSync;
      }

      const currentOwnerId = getCartOwnerId();

      if (!isLoggedInOwner(currentOwnerId)) {
        const state = get();

        if (force || state.ownerId !== currentOwnerId) {
          const guestSnapshot = getStoredCartSnapshot(currentOwnerId);

          return applySnapshot(guestSnapshot, {
            persist: false,
            broadcast: false,
          });
        }

        return state.items;
      }

      pendingRemoteSync = (async () => {
        set({
          isSyncing: true,
          syncError: '',
        });

        try {
          if (mergeGuest) {
            const guestSnapshot = getStoredCartSnapshot('guest');

            if (guestSnapshot.items.length > 0) {
              await mergeGuestCartToRemote(guestSnapshot.items);

              clearStoredCartSnapshot('guest');
            }
          }

          return await refreshRemoteCart({
            broadcast: true,
          });
        } catch (error) {
          set({
            syncError: error?.message || '장바구니를 불러오지 못했습니다.',
          });

          const cachedSnapshot = getStoredCartSnapshot(currentOwnerId);

          applySnapshot(cachedSnapshot, {
            persist: false,
            broadcast: false,
          });

          return cachedSnapshot.items;
        } finally {
          set({
            isSyncing: false,
          });

          pendingRemoteSync = null;
        }
      })();

      return pendingRemoteSync;
    },

    applyExternalSnapshot: (snapshot) => {
      if (!snapshot || snapshot.ownerId !== getCartOwnerId()) {
        return;
      }

      const state = get();
      const incomingUpdatedAt = Number(snapshot.updatedAt) || 0;

      if (incomingUpdatedAt <= Number(state.lastSyncedAt)) {
        return;
      }

      applySnapshot(
        {
          ownerId: snapshot.ownerId,
          items: normalizeItems(snapshot.items),
          updatedAt: incomingUpdatedAt,
        },
        {
          persist: true,
          broadcast: false,
        }
      );
    },
  };
});

export const subscribeToCartBroadcast = (listener) => {
  const channel = getChannel();

  if (!channel) {
    return () => {};
  }

  const handleMessage = (event) => {
    const message = event.data;

    if (!message || message.type !== 'CART_UPDATED' || message.sourceId === TAB_ID) {
      return;
    }

    listener(message.snapshot);
  };

  channel.addEventListener('message', handleMessage);

  return () => {
    channel.removeEventListener('message', handleMessage);
  };
};
